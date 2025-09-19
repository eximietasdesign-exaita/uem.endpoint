using Microsoft.Win32;
using ScriptExecLib.Models;
using ScriptExecLib.Utils;
using System.Runtime.InteropServices;

namespace ScriptExecLib.Services
{
    public sealed class RegistryQueryService
    {
        public string QueryAsJson(RegistryQueryOptions options) => JsonHelpers.Serialize(Query(options));

        public RegistryNode Query(RegistryQueryOptions options)
        {
            if (!RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                throw new PlatformNotSupportedException("Windows Registry is only available on Windows.");

            var (hive, subPath) = ParseRoot(options.RootKeyPath);
            using var baseKey = RegistryKey.OpenBaseKey(hive, RegistryView.Default);
            using var root = string.IsNullOrEmpty(subPath) ? baseKey : baseKey.OpenSubKey(subPath);

            var rootNode = new RegistryNode { KeyPath = options.RootKeyPath };
            if (root is null)
            {
                rootNode.Values["__error__"] = "KeyNotFound";
                return rootNode;
            }

            Recurse(root, rootNode, 0, options);
            return rootNode;
        }

        private static (RegistryHive hive, string sub) ParseRoot(string path)
        {
            if (string.IsNullOrWhiteSpace(path))
                throw new ArgumentException("RootKeyPath must not be empty.");

            var idx = path.IndexOf('\\');
            var hiveStr = idx > 0 ? path.Substring(0, idx) : path;
            var sub = idx > 0 ? path.Substring(idx + 1) : string.Empty;
            var hive = hiveStr.ToUpperInvariant() switch
            {
                "HKEY_LOCAL_MACHINE" or "HKLM" => RegistryHive.LocalMachine,
                "HKEY_CURRENT_USER" or "HKCU" => RegistryHive.CurrentUser,
                "HKEY_CLASSES_ROOT" or "HKCR" => RegistryHive.ClassesRoot,
                "HKEY_USERS" or "HKU" => RegistryHive.Users,
                "HKEY_CURRENT_CONFIG" or "HKCC" => RegistryHive.CurrentConfig,
                _ => throw new ArgumentException($"Unsupported hive: {hiveStr}")
            };
            return (hive, sub);
        }

        private static void Recurse(RegistryKey key, RegistryNode node, int depth, RegistryQueryOptions opts)
        {
            try
            {
                if (opts.IncludeValues)
                {
                    foreach (var name in key.GetValueNames())
                    {
                        object? value = null;
                        RegistryValueKind kind = RegistryValueKind.Unknown;
                        try
                        {
                            kind = key.GetValueKind(name);
                            value = key.GetValue(name);
                        }
                        catch (Exception ex)
                        {
                            node.Values[$"{name}"] = $"__error__: {ex.Message}";
                            continue;
                        }
                        node.Values[$"{name} ({kind})"] = Normalize(kind, value);
                    }
                }

                if (depth >= opts.MaxDepth) return;

                foreach (var subName in key.GetSubKeyNames())
                {
                    RegistryKey? sub = null;
                    try
                    {
                        sub = key.OpenSubKey(subName);
                        if (sub is null)
                        {
                            node.SubKeys.Add(new RegistryNode
                            {
                                KeyPath = $"{node.KeyPath}\\{subName}",
                                Values = new Dictionary<string, object?> { ["__error__"] = "OpenSubKey returned null" }
                            });
                            continue;
                        }

                        var child = new RegistryNode { KeyPath = $"{node.KeyPath}\\{subName}" };
                        node.SubKeys.Add(child);
                        Recurse(sub, child, depth + 1, opts);
                    }
                    catch (UnauthorizedAccessException)
                    {
                        node.SubKeys.Add(new RegistryNode
                        {
                            KeyPath = $"{node.KeyPath}\\{subName}",
                            Values = new Dictionary<string, object?> { ["__error__"] = "UnauthorizedAccess" }
                        });
                    }
                    catch (Exception ex)
                    {
                        node.SubKeys.Add(new RegistryNode
                        {
                            KeyPath = $"{node.KeyPath}\\{subName}",
                            Values = new Dictionary<string, object?> { ["__error__"] = ex.Message }
                        });
                    }
                    finally
                    {
                        sub?.Dispose();
                    }
                }
            }
            catch (Exception ex)
            {
                node.Values["__error__"] = ex.Message;
            }
        }

        private static object? Normalize(RegistryValueKind kind, object? value) => kind switch
        {
            RegistryValueKind.Binary => value is byte[] b ? Convert.ToBase64String(b) : value,
            RegistryValueKind.MultiString => value is string[] arr ? arr : value,
            _ => value
        };
    }
}
