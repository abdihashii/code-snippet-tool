# End-to-End Encrypted Image Sharing

This document outlines the plan for introducing secure, end-to-end encrypted (E2EE) image sharing.

## 1. Feature Overview

The core idea is to extend our existing zero-knowledge E2EE capabilities from code and text snippets to user-uploaded images. This will allow users to share images with the same high level of privacy and security, ensuring that our servers have no knowledge of the plaintext image content.

## 2. User Experience

This feature will be integrated into the existing snippet creation flow. Users will see a new option to upload an image. The sharing and decryption process will remain identical to the current flow for text-based snippets, either via a shareable link containing the decryption key or through password-based decryption.

## 3. Security Guarantee

We will use the same battle-tested, client-side encryption architecture that currently protects text snippets.

- **Zero-Knowledge:** Images are encrypted in the user's browser _before_ being uploaded. The server only ever stores the encrypted ciphertext.
- **Client-Side Keys:** The decryption key (DEK) is never sent to the server. It is either managed by the user (as part of the URL fragment) or encrypted with a password that the server never sees.
- **Algorithm:** We will use the Web Crypto API with AES-256-GCM, which provides strong confidentiality and authenticity for the encrypted data.

This ensures that only the sender and the intended recipient can view the shared image.

## 4. Short-Term Implementation (MVP)

The initial implementation will leverage our existing encryption logic by reading the selected image into an `ArrayBuffer` in the browser and passing it to the current encryption functions.

- **File Handling:** Use the `FileReader` API to read the user's selected image as an `ArrayBuffer`.
- **Encryption:** Pass the `ArrayBuffer` to the existing `crypto.subtle.encrypt` workflow.
- **Decryption & Display:** After decryption, the resulting `ArrayBuffer` will be converted to a `Blob`, and `URL.createObjectURL()` will be used to create a temporary local URL to render the image in an `<img>` tag.

## 5. Long-Term Implementation (Large Files)

The MVP's in-memory approach does not scale to large files. A future iteration will implement streaming to support larger uploads efficiently.

- **Streaming Encryption:** Implement chunked reading of the file using the Streams API. Each chunk will be encrypted and uploaded sequentially. This avoids high memory usage in the browser.
- **Object Storage:** For storing large encrypted blobs, we will migrate from the PostgreSQL `BYTEA` column to a dedicated object storage solution (e.g., AWS S3, Cloudflare R2). This is more scalable and cost-effective for large binary files.

## 6. Usage Tiers and Limits

To manage costs and ensure service stability, we will introduce tiered limits. These limits are based on the **original, unencrypted file size**.

- **Free Tier:**

  - **File Size Limit:** 10 MB per image.
  - **Rationale:** This provides a good user experience for the MVP's in-memory architecture without overwhelming browser resources.

- **Pro Tier (Future):**
  - **Increased File Size Limit:** Up to 100 MB per image (or higher).
  - **Requirement:** This tier will only be available after the long-term, streaming architecture is implemented, as it's the only way to handle files of this size reliably.
