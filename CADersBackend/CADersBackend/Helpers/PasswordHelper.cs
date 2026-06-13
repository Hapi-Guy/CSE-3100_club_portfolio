using System.Security.Cryptography;
using System.Text;

namespace CADersBackend.Helpers
{
    /// <summary>
    /// Provides SHA-256 password hashing.
    /// Uses System.Security.Cryptography (framework-native, no NuGet needed).
    /// </summary>
    public static class PasswordHelper
    {
        /// <summary>
        /// Computes the SHA-256 hash of the given plain-text password.
        /// Returns the hash as a lowercase hexadecimal string.
        /// </summary>
        public static string ComputeHash(string password)
        {
            using (SHA256 sha256 = SHA256.Create())
            {
                byte[] bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));

                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    sb.Append(bytes[i].ToString("x2"));
                }
                return sb.ToString();
            }
        }
    }
}
