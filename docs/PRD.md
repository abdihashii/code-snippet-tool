# PRD: Secure Code Snippet Sharing (SLC)

**Created:** May 13, 2025
**Last Updated:** May 15, 2025

## 1. Introduction

This document outlines the requirements for the [[Simple, Lovable, Complete (SLC) | SLC]] version of a web application designed for developers to securely share code snippets. The core problem it solves is the need for a quick, secure, and straightforward method to share potentially sensitive or proprietary code snippets offering immediate, anonymous snippet sharing for maximum speed and simplicity, while also providing optional free user accounts for those who wish to manage their snippets and access enhanced features.

## 2. Goals & Objectives (SLC)

- Provide an extremely simple and fast web-based interface for creating and sharing encrypted code snippets.
- Ensure all submitted code snippets are encrypted client-side before transmission and stored encrypted at rest, with the service having no ability to decrypt them.
- Guarantee that snippets are only decrypt-able by individuals possessing the correct decryption key (either directly or via a password), with the service facilitating secure storage of encrypted blobs.
- Deliver a trustworthy, intuitive, and "lovable" user experience with a strong emphasis on security.
- Minimize data exposure by design, with optional features for ephemeral sharing.
- Offer optional, free user registration to enable basic snippet management and a smoother upgrade path to premium features.

## 3. Target Audience

Developers who need to:

- Quickly share code snippets with peers for review, collaboration, or assistance.
- Transfer code between their own machines securely.
- Share example code or utility functions.
- Prioritize security and simplicity over feature richness for this specific task.

## 4. Core Features & Requirements

### 4.1. Snippet Creation & Encryption

- **FR1.1:** Users must be able to paste or type raw code into a web interface.
- **FR1.2:** Users should be able to optionally provide an unencrypted title for the snippet (for recipient context).
- **FR1.3:** Users should be able to optionally specify the programming language of the snippet (for syntax highlighting).
- **FR1.4:** Users may optionally add a short, unencrypted "uploader information" text (e.g., name, purpose) to give context to the recipient.
- **FR1.5 (Client-Side Encryption Core):** All snippet encryption must occur client-side within the user's browser before any data is transmitted to the server.
  - a. Upon snippet submission by the uploader, the client-side application must generate a unique, cryptographically strong random Data Encryption Key (DEK) for that snippet.
  - b. The client-side application must encrypt the raw code snippet using this DEK, a newly generated unique Initialization Vector (IV_content), and an encryption algorithm that provides confidentiality and authenticity (e.g., AES-256-GCM, which produces an Authentication Tag, Auth_Tag_content).
  - c. Only the `encrypted_snippet_blob`, `IV_content`, and `Auth_Tag_content`, along with any unencrypted metadata (title, language, etc.), are to be sent to the server for storage. The plaintext snippet and the DEK (in its raw form for the default sharing method) must not be transmitted to or stored by the server.
- **FR1.6 (Shareable Link & Key Handling - Default/Free Flow):** After the server successfully stores the encrypted snippet data and assigns it a UUID:
  - a. The client-side application (uploader's browser) must present the uploader with:
    - i. The unique DEK generated in FR1.5a.
    * ii. A shareable HTTPS link incorporating the UUID and the DEK, typically by appending the DEK to the link as a URL fragment identifier (e.g., `https://yourtool.com/s/[UUID]#DEK`).
  * b. The UI must clearly inform the user that they need to share this complete link (including the fragment/DEK) with the recipient and that the security and accessibility of the snippet depend on the secrecy and integrity of this DEK in the fragment.
  * c. The server will also store information related to premium password protection if the user opts for that feature (see FR1.7).
- **FR1.7 (Premium Password-Protected Flow - Client-Side Key Encapsulation):** If a premium user opts for password protection for a snippet:
  - a. The core client-side encryption (FR1.5a, FR1.5b) occurs first, generating the DEK and `encrypted_snippet_blob`.
  - b. The client-side application must prompt the user for a password (`user_password`).
  - c. The client-side application must generate a unique salt (`kdf_salt`).
  - d. A Key Encryption Key (KEK) must be derived client-side from the `user_password` and `kdf_salt` using a strong Key Derivation Function (KDF) (e.g., Argon2id, PBKDF2). The KDF parameters (algorithm, iterations, memory cost, etc.) must be recorded.
  - e. The DEK (from FR1.5a) must be encrypted client-side using the KEK, a unique `IV_for_DEK`, and an algorithm like AES-256-GCM, producing `encrypted_DEK` and `Auth_Tag_for_DEK`.
  - f. For password-protected snippets, the client will send `encrypted_DEK`, `IV_for_DEK`, `Auth_Tag_for_DEK`, `kdf_salt`, and KDF parameters to the server, in addition to the `encrypted_snippet_blob` and its related IV/Auth Tag.
  - g. The shareable link for password-protected snippets will be the clean UUID link (e.g., `https://yourtool.com/s/[UUID]`). The user is responsible for communicating the `user_password` out-of-band.

### 4.2. Snippet Storage

- **FR2.1:** The application will use a PostgreSQL database.
- **FR2.2:** The database will store the fields as defined in the [[snippets table schema in DB|snippets table schema document]].
  - This includes the:
    - `id` (UUID)
    - `user_id` (if applicable)
    - `encrypted_content`
    - `initialization_vector` (for content)
    - `auth_tag` (for content)
    - unencrypted metadata (title, language, uploader_info), view/expiration controls, and timestamps.
    - a. For snippets using the premium password protection feature (FR1.7), the following additional fields (or a structured way to store them, e.g., a JSONB column) must also be stored by the server:
      - `encrypted_DEK`
      - `IV_for_DEK`
      - `Auth_Tag_for_DEK`
      - `kdf_salt`
      - `kdf_parameters`.
    - b. The server must never store plaintext DEKs or user passwords for password-protected snippets.

### 4.3. Secure Sharing & Access Control

- **FR3.1:** Snippets are shared by the uploader providing the shareable link to the intended recipient(s).
  - a. For default (free) snippets, this includes the link with the DEK in the URL fragment (`https://yourtool.com/s/[UUID]#DEK`).
  - b. For premium password-protected snippets, this includes the clean UUID link (`https://yourtool.com/s/[UUID]`) and the user-chosen password (communicated out-of-band).
- **FR3.2:** The application must not provide any way to list, browse, or search for snippets publicly. Access is exclusively via possessing the exact secret link.

### 4.4. Snippet Retrieval & Decryption

- **FR4.1 (Data Retrieval Request):** When a user accesses a snippet link:
  - a. The client-side application (recipient's browser) must extract the UUID from the URL path.
  - b. For default (free) snippets, the client-side application must also extract the DEK from the URL fragment (the part after '#').
  - c. The client-side application sends only the UUID to the server to request the snippet data.
- **FR4.1.1 (Server Response):** The server, upon receiving a valid UUID, will retrieve all stored data for that snippet (including `encrypted_snippet_blob`, `IV_content`, `Auth_Tag_content`, and if present, `encrypted_DEK`, `IV_for_DEK`, `Auth_Tag_for_DEK`, `kdf_salt`, `kdf_parameters`, and any unencrypted public metadata) and transmit these back to the client.
- **FR4.2 (Client-Side Decryption):** All snippet decryption must occur client-side within the user's browser.
  - a. **Default (Free) Snippets:** The client-side application uses the DEK (obtained in FR4.1b from the URL fragment), the received `IV_content`, and `Auth_Tag_content` to decrypt the `encrypted_snippet_blob` locally.
  - b. **Premium Password-Protected Snippets:**
    - i. The client-side application prompts the user to enter the `user_password`.
    - ii. Using the entered `user_password`, the received `kdf_salt`, and `kdf_parameters`, the client-side application re-derives the KEK.
    - iii. The client-side application uses the derived KEK, `IV_for_DEK`, and `Auth_Tag_for_DEK` to decrypt the `encrypted_DEK`, yielding the original DEK.
    - iv. The client-side application then uses this retrieved DEK, `IV_content`, and `Auth_Tag_content` to decrypt the `encrypted_snippet_blob` locally.
- **FR4.3:** The decrypted snippet content must be displayed clearly in the web interface.
- **FR4.4:** Syntax highlighting based on the snippet's specified language should be applied for readability.
- **FR4.5:** A simple "copy to clipboard" function for the displayed code snippet must be available.
- **FR4.6:** A 'Download snippet' function must be available, allowing the user to download the decrypted snippet content as a file.

### 4.5. Controlled Exposure (Optional but Recommended UX/Security Features)

- **FR5.1:** During snippet creation, users should have an option to set an automatic expiration date/time for the shareable link.
  - The application must prevent access to expired snippets, displaying an appropriate message.
- **FR5.2:** During snippet creation, users should have an option to set a maximum number of views for the link (e.g., 1 for "burn after reading").
  - The application must track views and prevent access after the limit is reached, displaying an appropriate message.

### 4.6. User Account Management (Optional, Free)

- **FR6.1:** The system must allow users to optionally register for a free account using an email address and a password.
- **FR6.2:** Registered users must be able to log in to their accounts.
- **FR6.3:** Registered users must be able to log out of their accounts.
- **FR6.4 (Basic Snippet Listing):** Authenticated free users should be able to see a list of snippets they created while logged in, with options to view or delete them. (Define if this is a simple list or a more developed dashboard for SLC).
- **FR6.5 (Password Security):** User passwords must be securely hashed (e.g., using Argon2, scrypt, or bcrypt) before storage.
- **FR6.6 (Password Reset):** A secure mechanism for password reset (e.g., via email confirmation) must be available.

## 5. Non-Functional Requirements (NFR)

- **NFR1. Security:**
  - **NFR1.1:** All application traffic (front-end and API) must be served exclusively over HTTPS to protect the secret link (containing the access key) in transit.
  - **NFR1.2 (Client-Side Cryptography):** Client-side encryption and decryption must use strong, vetted, industry-standard cryptographic libraries and algorithms (e.g., AES-256-GCM for symmetric encryption; Argon2id or PBKDF2 for key derivation from passwords). Secure random key (DEK) and IV generation practices must be employed on the client-side.
  - **NFR1.3:** Implement standard security best practices to protect against common web vulnerabilities (e.g., XSS, CSRF, SQL Injection).
  - **NFR1.4:** The database user credentials used by the application must have the minimum necessary permissions.
  - **NFR1.5:** Snippets should be treated as immutable once created to simplify the security model.
  - **NFR1.6 (Account Security):** Implement best practices for user account security, including protection against brute-force login attempts, secure password storage, and prevention of common account-related vulnerabilities.
  - **NFR1.7 (No Server-Side Plaintext Access):** The server must never receive or store plaintext user snippet content or user-managed decryption keys (DEKs or passwords).
  - **NFR1.8 (Client-Side Code Integrity):** Implement measures to ensure the integrity of the client-side JavaScript code responsible for cryptographic operations (e.g., Subresource Integrity, Content Security Policy).
  - **NFR1.9 (User Responsibility for Secrets):** The UI must clearly communicate to users their responsibility for securely managing their decryption keys (DEK in URL fragment for free flow) or passwords (for premium flow). It should be clear that if these are lost, the snippet data is unrecoverable by the service.
- **NFR2. Usability & UX:**
  - **NFR2.1:** The user interface must be minimalist, intuitive, and require no learning curve.
  - **NFR2.2:** Snippet creation and retrieval should be fast and responsive.
  - **NFR2.3:** Users must receive clear, concise feedback (e.g., successful link generation, informative error messages for invalid, expired, or rate-limited links).
- **NFR3. Reliability:**
  - **NFR3.1:** The service should maintain high availability for accessing and creating snippets.
  - **NFR3.2:** The PostgreSQL database ensures durable storage of encrypted snippets.

## 6. Success Metrics (SLC)

- Qualitative feedback from initial users indicating ease of use and trustworthiness.
- Adoption rate: number of snippets created over a defined period.
- Zero reported security incidents related to snippet confidentiality.

## 7. Future Considerations (Out of Scope for this SLC)

- Advanced user and team management (e.g., roles, permissions, team-based snippet libraries, enhanced dashboards).
- Snippet editing or versioning.
- Organization/team-based sharing and permissions.
- Full-text search across snippet content (requires significant re-evaluation for encrypted data).
- Public API for programmatic snippet creation/access.
- Admin interface for moderation or analytics.
