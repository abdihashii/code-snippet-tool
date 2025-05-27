# Frequently Asked Questions

## Security of Snippet Retrieval (GET /snippets/:snippet-id)

**Question:** If we get a response from the `GET /snippets/:snippet-id` endpoint, can a bad actor with access to the shared link but NOT the Data Encryption Key (DEK) or knowledge of the password take advantage of this information to decrypt the code?

**Answer:** No, a bad actor cannot decrypt the snippet content solely with the information returned by the `GET /snippets/:snippet-id` API endpoint, even if they have the shareable link. The decryption process requires an additional secret that is not exposed by this API call.

The security relies on the principle that the server provides encrypted data and the necessary public parameters for decryption, but the final secret needed to decrypt (either the Data Encryption Key directly for non-password-protected snippets, or the password to derive it for password-protected ones) is not exposed in the API response itself.

Here's a breakdown for both scenarios:

### 1. Non-Password-Protected Snippets (DEK in URL fragment)

*   **What the API response contains:**
    *   `encrypted_content`: The snippet content, encrypted.
    *   `initialization_vector`: The IV used for encrypting the content.
    *   `auth_tag`: The authentication tag to verify the integrity of the encrypted content.
    *   Other metadata like `id`, `title`, `language`, `expires_at`, etc.

*   **What's missing from the API response for decryption:**
    *   The crucial piece missing is the **Data Encryption Key (DEK)**.

*   **How it works:**
    *   For non-password-protected snippets, the DEK is generated on the client-side when the snippet is created.
    *   This DEK is then appended to the shareable link as a URL fragment (e.g., `https://yourdomain.com/s/snippet-id#DEK_VALUE`).
    *   URL fragments (the part after the `#`) are **not** sent to the server with the HTTP request. So, when the client application fetches snippet details from the API, the server never sees or has access to this DEK.
    *   The client-side application code reads the DEK from the URL fragment (`window.location.hash`).
    *   The client-side decryption function (`decryptSnippet`) then uses this DEK (from the URL fragment), along with the `encrypted_content`, `initialization_vector`, and `auth_tag` (obtained from the API response), to decrypt the snippet.

*   **Can an attacker decrypt with only the API response?**
    *   **No.** Without the DEK (which is in the URL fragment and not part of the API response), an attacker cannot decrypt the `encrypted_content`. The encryption algorithm used (AES-GCM) is secure, and without the key, the ciphertext remains protected.

### 2. Password-Protected Snippets

*   **What the API response contains:**
    *   `encrypted_content`: The snippet content, encrypted.
    *   `initialization_vector`: The IV for the `encrypted_content`.
    *   `auth_tag`: The authentication tag for the `encrypted_content`.
    *   `encrypted_dek`: The Data Encryption Key, itself encrypted with a Key Encryption Key (KEK).
    *   `iv_for_dek`: The IV used for encrypting the DEK.
    *   `auth_tag_for_dek`: The authentication tag for the `encrypted_dek`.
    *   `kdf_salt`: The salt used for deriving the KEK from the password.
    *   `kdf_parameters`: Parameters for the Key Derivation Function (PBKDF2), including `iterations` and `hash` algorithm.
    *   Other metadata.

*   **What's missing from the API response for decryption:**
    *   The **password**.

*   **How it works:**
    1.  The client-side application prompts the user for the password.
    2.  The client-side decryption function (`decryptSnippet`) takes this password.
    3.  The **Key Encryption Key (KEK)** is derived from the user-provided `password`, the `kdf_salt`, and `kdf_parameters` (all from the API response) using PBKDF2. This is a computationally intensive process designed to resist brute-force attacks.
    4.  This derived KEK is then used to decrypt the `encrypted_dek` (using `iv_for_dek` and `auth_tag_for_dek` from the API response). This step recovers the actual **Data Encryption Key (DEK)**.
    5.  Finally, this recovered DEK is used with `encrypted_content`, `initialization_vector`, and `auth_tag` (all from the API response) to decrypt the actual snippet content.

*   **Can an attacker decrypt with only the API response?**
    *   **No, not without successfully guessing or brute-forcing the password.**
    *   An attacker has the `encrypted_dek` and all the public parameters (`kdf_salt`, `kdf_parameters`) needed to *attempt* to derive the KEK. However, they are missing the password.
    *   To decrypt the `encrypted_dek`, they would need to brute-force the password. The use of a strong Key Derivation Function like PBKDF2 with a high iteration count makes each password guess computationally expensive. This significantly slows down brute-force attempts, and the security of this method relies on the strength and uniqueness of the user's chosen password.
    *   If they cannot derive the correct KEK (because they don't have the password), they cannot decrypt the `encrypted_dek` to get the actual DEK, and therefore cannot decrypt the `encrypted_content`.

### Summary

In both scenarios, the API response provides the encrypted data and the public components necessary for the legitimate client (which has access to the DEK via URL fragment or can derive it from a user-provided password) to perform decryption. It does not, however, leak the sensitive keying material itself.

*   **Non-Password Protected:** Security relies on the DEK being transmitted via a URL fragment, which is not exposed to the server or in the direct API response path.
*   **Password Protected:** Security relies on the strength of the user's password and the computational difficulty of reversing the Key Derivation Function (PBKDF2) without knowing the password. 