export const forgotPasswordTemplate = (firstName, resetLink) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
</head>
<body style="font-family: Arial, sans-serif; background:#f5f5f5; padding:30px;">
  <div style="max-width:600px; margin:auto; background:#fff; padding:30px; border-radius:8px;">
    
    <h2>Password Reset Request</h2>

    <p>Hello ${firstName},</p>

    <p>
      We received a request to reset your password.
    </p>

    <p>
      Click the button below to create a new password.
    </p>

    <a
      href="${resetLink}"
      style="
        display:inline-block;
        padding:12px 25px;
        background:#2563eb;
        color:#fff;
        text-decoration:none;
        border-radius:6px;
      "
    >
      Reset Password
    </a>

    <p style="margin-top:25px;">
      This link will expire in <strong>15 minutes</strong>.
    </p>

    <p>
      If you didn't request this, simply ignore this email.
    </p>

    <hr />

    <small>
      This is an automated email. Please do not reply.
    </small>

  </div>
</body>
</html>
`;
