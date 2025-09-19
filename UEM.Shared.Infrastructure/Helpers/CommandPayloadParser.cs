using System.Text.Json;
using System.Text.Json.Nodes;

namespace UEM.Shared.Infrastructure.Helpers;

public static class CommonUtils
{
    
    // <summary>
    /// Parses a JSON string and extracts the value of the "command" key.
    /// This function handles complex JSON structures.
    /// </summary>
    /// <param name="jsonString">The JSON string to parse.</param>
    /// <returns>The value of the "command" key, or null if not found.</returns>
    public static string GetCommandFromJson(this string jsonString)
    {
        if (string.IsNullOrEmpty(jsonString))
        {
            return null;
        }

        try
        {
            // Use JsonNode to parse the JSON, as it's flexible for complex or unknown structures.
            var jsonNode = JsonNode.Parse(jsonString);

            // Try to get the "command" property.
            // This safely navigates the JSON object without throwing an exception if the key doesn't exist.
            var commandProperty = jsonNode?["command"];

            // Check if the property exists and is a JSON value.
            if (commandProperty is JsonValue commandValue)
            {
                // Attempt to get the string value from the JsonValue.
                if (commandValue.TryGetValue<string>(out var command))
                {
                    return command;
                }
            }
        }
        catch (JsonException ex)
        {
            Console.WriteLine($"Error parsing JSON: {ex.Message}");
            // Handle parsing errors, e.g., malformed JSON.
        }
        catch (Exception ex)
        {
            Console.WriteLine($"An unexpected error occurred: {ex.Message}");
        }

        return null;
    }

}