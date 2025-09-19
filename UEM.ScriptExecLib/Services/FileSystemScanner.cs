using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ScriptExecLib.Models;
using ScriptExecLib.Utils;

namespace ScriptExecLib.Services
{
    /// <summary>
    /// Provides recursive file system scanning with depth and extension filters.
    /// </summary>
    public sealed class FileSystemScanner
    {
        public async Task<string> ScanAsync(FileScanOptions options, CancellationToken ct = default)
        {
            var files = await Task.Run(() => ScanInternal(options, ct), ct);
            return JsonHelpers.Serialize(files);
        }

        public IReadOnlyList<FileEntry> Scan(FileScanOptions options)
        {
            return ScanInternal(options, CancellationToken.None);
        }

        private static List<FileEntry> ScanInternal(FileScanOptions options, CancellationToken ct)
        {
            var result = new List<FileEntry>();

            void Recurse(string path, int depth)
            {
                if (ct.IsCancellationRequested) return;
                if (depth > options.MaxDepth) return;

                try
                {
                    var dirInfo = new DirectoryInfo(path);
                    if (!dirInfo.Exists) return;

                    // Add directory itself
                    result.Add(new FileEntry
                    {
                        Path = dirInfo.FullName,
                        IsDirectory = true,
                        SizeBytes = 0,
                        LastModifiedUtc = dirInfo.LastWriteTimeUtc
                    });

                    foreach (var file in dirInfo.GetFiles())
                    {
                        if (options.IncludeExtensions != null &&
                            options.IncludeExtensions.Any() &&
                            !options.IncludeExtensions.Contains(file.Extension, StringComparer.OrdinalIgnoreCase))
                        {
                            continue;
                        }

                        result.Add(new FileEntry
                        {
                            Path = file.FullName,
                            IsDirectory = false,
                            SizeBytes = file.Length,
                            LastModifiedUtc = file.LastWriteTimeUtc
                        });
                    }

                    foreach (var subDir in dirInfo.GetDirectories())
                    {
                        if (!options.IncludeHidden && (subDir.Attributes & FileAttributes.Hidden) != 0)
                            continue;
                        Recurse(subDir.FullName, depth + 1);
                    }
                }
                catch (UnauthorizedAccessException)
                {
                    // Skip directories we can't access
                }
                catch (Exception)
                {
                    // Log or ignore
                }
            }

            Recurse(options.RootPath, 0);
            return result;
        }
    }
}
