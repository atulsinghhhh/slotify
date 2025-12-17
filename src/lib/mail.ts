import nodemailer from "nodemailer";

export async function sendVerificationEmail(email: string, token: string) {
    const transporter = nodemailer.createTransport({
       host: process.env.EMAIL_USER,
       port: Number(process.env.EMAIL_SERVER_PORT),
       auth: {
         user: process.env.EMAIL_USER,
         pass: process.env.EMAIL_PASS,
       },
       // Fallback for development if env vars are missing  - printing to console handled below
    });

    // If no credentials, just log it for dev
    if (!process.env.EMAIL_USER) {
        console.log("==========================================");
        console.log(`[DEV MODE] Verification for ${email}: ${token}`);
        console.log("==========================================");
        return true;
    }

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: "Verify your email address",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2>Verify your email</h2>
                    <p>Your verification code is:</p>
                    <h1 style="background: #f4f4f4; padding: 10px; text-align: center; letter-spacing: 5px;">${token}</h1>
                    <p>Enter this code to complete your registration.</p>
                </div>
            `
        });
        return true;
    } catch (error) {
        console.error("Failed to send email:", error);
        return false;
    }
}
