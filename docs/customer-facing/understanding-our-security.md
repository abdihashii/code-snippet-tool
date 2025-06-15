# Understanding Our Security & Your Privacy

## The Promise: Your Privacy is Not an Afterthought

We believe you should have sole control over who sees your data. That's why we designed our service so that **we can't see your shared content. Period.**

Our platform is built on a "zero-knowledge" principle. This means when you share a code snippet or an image, the encryption happens on your device before it ever reaches our servers. We only ever store the encrypted version, and we have no way to unlock it.

This document explains how this works, what it means for you, and the important role you play in keeping your data safe.

## How It Works: Your Personal Digital Safe

Think of our service as providing you with a personal digital safe.

1.  **You put your content in the safe:** When you're ready to share, your browser encrypts your image or text.
2.  **You lock it with a unique key:** A secret decryption key is generated. This key is the only thing that can unlock your content.
3.  **You hold the only key:** For standard sharing, this key is added to the link you get (in the part after the `#`). For password-protected shares, the key is locked with your password. In both cases, the key never touches our servers.

We store the safe for you, but we have absolutely no way to open it. Only the person with the correct link or password can unlock and view the content.

## How Strong Is the Encryption?

The encryption we use is called AES-256. It is the gold standard for securing data and is trusted by governments and security-conscious organizations worldwide.[^1]

So, what would it take for an attacker to break this encryption, even if they stole the encrypted data from our servers?

To put it simply, it's impossible with today's technology. Even if an attacker had the world's fastest supercomputer, it would take them **billions of years** to guess the correct key. The number of possible keys is so vast that it's larger than the number of atoms in the known universe.[^2]

This level of security means you can be confident that your data is protected against brute-force attacks today and for the foreseeable future.

## What This Means for You (The Benefits)

This security model provides powerful protections:

- **True Confidentiality:** Only the people you share the link or password with can see your content. No one else.
- **Protection from Us:** Our team can't access your content for any reason. Your privacy is structurally guaranteed.
- **Protection from Breaches:** In the unlikely event of a server breach, your files would remain safely encrypted and unreadable to attackers.

This is the foundation of our promise: we can't see your data, and we can't share it with anyone.

## The Trade-Offs for a Zero-Knowledge World

Our commitment to your privacy means we have to give up certain features that are common on other platforms. Because we can't see your content, we cannot:

- **Show Image Previews:** We can't generate thumbnails or previews for your images because we can't see the image data. You'll see a generic placeholder instead.
- **Scan for Malicious Content:** We cannot automatically scan for abusive, illegal, or malicious content. We rely on you and our community to report content that violates our policies.
- **Offer Account Recovery:** This is the most important trade-off. **If you lose your sharing link or forget your password, your data is gone forever.** We have no "backdoor" or "master key" to restore access.

## Your Role as the Keyholder

Your security is a partnership. Because you hold the key, you have a vital role to play.

- **Treat your sharing link like a password.** Anyone who has it can see your content.
- **Share links and passwords only with people you trust.**
- **Double-check that you've saved your link or password.** We want to be crystal clear: we cannot help you get it back if you lose it.

Thank you for choosing a service that puts your privacy first. We believe this user-centric security model is the right way to handle sensitive data, and we're glad to have you as part of a more private web.

[^1]: The Advanced Encryption Standard (AES) was established as a U.S. federal standard in 2001. You can view the official publication from the National Institute of Standards and Technology (NIST): [FIPS PUB 197](https://doi.org/10.6028/NIST.FIPS.197-upd1).

[^2]: The AES-256 key space is 2^256, which results in approximately 1.1 x 10^77 possible keys. For context on this astronomically large number, see ["Why we moved to 256-bit AES keys"](https://blog.1password.com/why-we-moved-to-256-bit-aes-keys/). The estimated number of atoms in the observable universe is between 10^78 and 10^82. You can read more about this estimate here: ["How many atoms are in the observable universe?"](https://www.livescience.com/how-many-atoms-in-universe.html).
