using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Unicode;
namespace ScriptExecLib.Utils;
public static class JsonHelpers
{
    private static readonly JsonSerializerOptions Options = new()
    {
        WriteIndented = false,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Encoder = JavaScriptEncoder.Create(UnicodeRanges.All)
    };
    public static string Serialize<T>(T value) => JsonSerializer.Serialize(value, Options);
}
