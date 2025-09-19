using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using System.Management;                 // from System.Management NuGet package
using System.Runtime.InteropServices;

using ScriptExecLib.Models;
using ScriptExecLib.Utils;

namespace ScriptExecLib.Services
{
    public sealed class WmiQueryService
    {
        public async Task<string> QueryAsync(WmiQueryRequest request, CancellationToken ct = default)
        {
            var result = await QueryObjectsAsync(request, ct).ConfigureAwait(false);
            return JsonHelpers.Serialize(result);
        }

        public async Task<IReadOnlyList<Dictionary<string, object?>>> QueryObjectsAsync(
            WmiQueryRequest request, CancellationToken ct = default)
        {
            if (!RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                throw new PlatformNotSupportedException("WMI is only supported on Windows.");

            return await Task.Run(() =>
            {
                var ns = NormalizeNamespace(request.Namespace);
                var scopePath = $@"\\.\{ns}";

                var conn = new ConnectionOptions
                {
                    EnablePrivileges = true,
                    Impersonation = ImpersonationLevel.Impersonate,
                    Authentication = AuthenticationLevel.PacketPrivacy,
                    Timeout = request.Timeout ?? TimeSpan.FromSeconds(30)
                };

                // ManagementScope only explicitly implements IDisposable
                var scope = new ManagementScope(scopePath, conn);
                try
                {
                    scope.Connect();

                    var q = new ObjectQuery(request.Query);

                    // disambiguate EnumerationOptions to System.Management.EnumerationOptions
                    var enumOptions = new System.Management.EnumerationOptions
                    {
                        ReturnImmediately = false,
                        Timeout = request.Timeout ?? TimeSpan.FromSeconds(30)
                    };

                    var list = new List<Dictionary<string, object?>>();

                    using (var searcher = new ManagementObjectSearcher(scope, q, enumOptions))
                    {
                        foreach (ManagementObject obj in searcher.Get())
                        {
                            var dict = new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);
                            foreach (var prop in obj.Properties)
                                dict[prop.Name] = prop.Value;
                            list.Add(dict);
                        }
                    }

                    return (IReadOnlyList<Dictionary<string, object?>>)list;
                }
                finally
                {
                    //scope.Dispose();
                }
            }, ct).ConfigureAwait(false);
        }

        private static string NormalizeNamespace(string? ns)
        {
            var s = string.IsNullOrWhiteSpace(ns) ? @"root\cimv2" : ns;

            // Normalize to backslashes and strip leading slashes
            s = s.Replace('/', '\\').Trim('\\');

            if (s.StartsWith(@".\", StringComparison.Ordinal))
                s = s.Substring(2);
            if (s.StartsWith(@"\\.\", StringComparison.Ordinal))
                s = s.Substring(3);

            return s; // e.g. "root\\cimv2"
        }
    }
}
