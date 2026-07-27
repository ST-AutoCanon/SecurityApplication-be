export const securityInviteTemplate = (firstName, inviteLink) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
</head>
<body style="font-family: Arial, sans-serif; background:#f5f5f5; padding:30px;">
  <div style="max-width:600px; margin:auto; background:#fff; padding:30px; border-radius:8px;">

    <h2 style="color:#111827; margin-bottom:20px;">
      Welcome to the Security Portal
    </h2>

    <p>Hello ${firstName},</p>

    <p>
      Your security account has been successfully created.
    </p>

    <p>
      To activate your account, please click the button below and set your password.
    </p>

    <a
      href="${inviteLink}"
      style="
        display:inline-block;
        padding:12px 25px;
        background:#16a34a;
        color:#ffffff;
        text-decoration:none;
        border-radius:6px;
        font-weight:bold;
      "
    >
      Set Your Password
    </a>

    <p style="margin-top:25px;">
      This invitation link will expire in <strong>24 hours</strong>.
    </p>

    <p>
      If you were not expecting this invitation, you can safely ignore this email or contact your administrator.
    </p>

    <hr style="margin:30px 0; border:none; border-top:1px solid #e5e7eb;" />

    <small style="color:#6b7280;">
      This is an automated email. Please do not reply.
    </small>

  </div>
</body>
</html>
`;