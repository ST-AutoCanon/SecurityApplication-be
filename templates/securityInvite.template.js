export const securityInviteTemplate = (firstName, inviteLink) => `
<h2>Hello ${firstName},</h2>

<p>Your security account has been created.</p>

<p>
  <a href="${inviteLink}">
    Click here to set your password
  </a>
</p>

<p>This link expires in 24 hours.</p>
`;
