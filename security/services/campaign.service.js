import masterAuthDB from "../../config/masterAuthDB.js";
import { getDB } from "../../config/dbFactory.js";
import { getOrganisationById } from "../../auth/models/organisation.model.js";
import nodemailer from "nodemailer";
import * as model from "../models/campaign.model.js";
import * as blockModel from "../models/campaignBlock.model.js";   // ← ADD THIS
// ===================== GET ALL CAMPAIGNS =====================
// ===================== EMAIL TRANSPORTER (same as forms) =====================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD?.replace(/\s+/g, ""),
  },
});

// ===================== BUILD EMAIL HTML =====================
// function buildEmailHtml(blocks) {
//   let body = "";

//   for (const block of blocks) {
//     let content = block.content || {};
//     if (typeof content === "string") {
//       try {
//         content = JSON.parse(content);
//       } catch {
//         content = {};
//       }
//     }

//     switch (block.block_type) {
//       case "logo":
//         if (content.url) {
//           body += `
//             <div style="text-align:center;margin-bottom:20px;">
//               <img src="${content.url}" alt="Logo" style="max-height:60px;object-fit:contain;" />
//             </div>`;
//         }
//         break;

//       case "image":
//         if (content.url) {
//           body += `
//             <div style="margin-bottom:16px;">
//               <img src="${content.url}" alt="" style="width:100%;max-width:600px;border-radius:8px;" />
//             </div>`;
//         }
//         break;

//       case "text":
//         body += `
//           <div style="font-size:15px;line-height:1.6;color:#334155;margin-bottom:16px;white-space:pre-wrap;">
//             ${(content.text || "").replace(/\n/g, "<br>")}
//           </div>`;
//         break;

//       case "button":
//         body += `
//           <div style="text-align:${content.align || "center"};margin:24px 0;">
//             <a href="${content.buttonLink || "#"}"
//                style="display:inline-block;background:#7c3aed;color:#ffffff;
//                       padding:12px 28px;border-radius:8px;font-weight:600;
//                       text-decoration:none;font-size:15px;">
//               ${content.buttonText || "Click Here"}
//             </a>
//           </div>`;
//         break;

//       case "divider":
//         body += `<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />`;
//         break;
//     }
//   }

//   return `
//     <!DOCTYPE html>
//     <html>
//     <head><meta charset="utf-8" /></head>
//     <body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
//       <div style="max-width:600px;margin:30px auto;background:#ffffff;border-radius:12px;overflow:hidden;">
//         <div style="padding:32px 28px;">
//           ${body}
//         </div>
//         <div style="background:#f8fafc;padding:20px;text-align:center;font-size:12px;color:#94a3b8;">
//           © ${new Date().getFullYear()} Your Company. All rights reserved.
//         </div>
//       </div>
//     </body>
//     </html>
//   `;
// }
// ===================== BUILD EMAIL HTML =====================
function buildEmailHtml(blocks) {
  let body = "";

  for (const block of blocks) {
    let content = block.content || {};
    if (typeof content === "string") {
      try {
        content = JSON.parse(content);
      } catch {
        content = {};
      }
    }

    // accept both snake_case and camelCase from DB
    const type = block.block_type || block.blockType;

    switch (type) {
           case "logo":
        if (content.url) {
          body += `
            <div style="text-align:center;margin-bottom:20px;">
              <img src="${content.url}" alt="Logo" style="max-height:60px;object-fit:contain;" />
            </div>`;
        }
        break;

      case "image":
        if (content.url) {
          body += `
            <div style="margin-bottom:16px;">
              <img src="${content.url}" alt="" style="width:100%;max-width:600px;border-radius:8px;" />
            </div>`;
        }
        break;

      case "text": {
        const color = content.color || "#334155";
        const fontSize = content.fontSize || 14;
        const fontWeight = content.fontWeight || "normal";
        const fontStyle = content.fontStyle || "normal";
        const textAlign = content.textAlign || "left";
        const bg =
          content.backgroundColor && content.backgroundColor !== "transparent"
            ? content.backgroundColor
            : null;

        const styles = [
          `font-size:${fontSize}px`,
          `line-height:1.6`,
          `color:${color}`,
          `font-weight:${fontWeight}`,
          `font-style:${fontStyle}`,
          `text-align:${textAlign}`,
          `margin:0 0 16px 0`,
          `white-space:pre-wrap`,
        ];

        if (bg) {
          styles.push(`background-color:${bg}`);
          styles.push(`padding:10px 12px`);
          styles.push(`border-radius:6px`);
        }

        // Basic HTML escape
        const safeText = String(content.text || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/\n/g, "<br>");

        body += `<div style="${styles.join(";")}">${safeText}</div>`;
        break;
      }

      case "button":
        body += `
          <div style="text-align:${content.align || "center"};margin:24px 0;">
            <a href="${content.buttonLink || "#"}"
               style="display:inline-block;background:#7c3aed;color:#ffffff;
                      padding:12px 28px;border-radius:8px;font-weight:600;
                      text-decoration:none;font-size:15px;">
              ${content.buttonText || "Click Here"}
            </a>
          </div>`;
        break;

      case "divider":
        body += `<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />`;
        break;
    }
  }

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:30px auto;background:#ffffff;border-radius:12px;overflow:hidden;">
        <div style="padding:32px 28px;">
          ${body}
        </div>
        <div style="background:#f8fafc;padding:20px;text-align:center;font-size:12px;color:#94a3b8;">
          © ${new Date().getFullYear()} Your Company. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;
}

// ===================== SEND CAMPAIGN =====================
export const sendCampaignService = async (organisationId, campaignId, emails) => {
  try {
    const org = await getOrganisationById(masterAuthDB, organisationId);
    if (!org) {
      return { success: false, message: "Organisation not found" };
    }

    const db = getDB(org.org_type);
    const schema = org.schema_name;

    // Get campaign
    const campaign = await model.getCampaignById(db, schema, campaignId);
    if (!campaign) {
      return { success: false, message: "Campaign not found" };
    }

    // Get blocks
    const blocks = await blockModel.getCampaignBlocks(db, schema, campaignId);

    // Build HTML
    const html = buildEmailHtml(blocks);

    // Clean emails
    const validEmails = emails
      .map((e) => e.trim())
      .filter((e) => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

    if (validEmails.length === 0) {
      return { success: false, message: "No valid email addresses provided" };
    }

    // Send email (same style as forms)
    await transporter.sendMail({
      from: `"Campaign" <${process.env.MAIL_USER}>`,
      to: validEmails.join(", "),
      subject: campaign.subject || "No Subject",
      html,
    });

    // Update status to Sent
    await model.updateCampaign(db, schema, campaignId, {
      campaign_name: campaign.campaign_name,
      channel: campaign.channel,
      category: campaign.category,
      subject: campaign.subject,
      preheader: campaign.preheader,
      status: "Sent",
      scheduled_at: campaign.scheduled_at,
    });

    return {
      success: true,
      message: `Campaign sent successfully to ${validEmails.length} recipient(s)`,
    };
  } catch (err) {
    console.error("sendCampaignService error:", err);
    return {
      success: false,
      message: err.message || "Failed to send campaign",
    };
  }
};
export const getAllCampaignsService = async (organisationId) => {
  try {
    const org = await getOrganisationById(
      masterAuthDB,
      organisationId
    );

    if (!org) {
      return {
        success: false,
        message: "Organisation not found",
      };
    }

    const db = getDB(org.org_type);
    const schema = org.schema_name;

    const rows = await model.getAllCampaigns(
      db,
      schema
    );

    const data = rows.map((row) => ({
      id: String(row.id),
      campaignName: row.campaign_name,
      channel: row.channel,
      category: row.category,
      subject: row.subject,
      preheader: row.preheader,
      status: row.status,
      scheduledAt: row.scheduled_at,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return {
      success: true,
      data,
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
};

// ===================== GET ONE CAMPAIGN =====================

export const getCampaignByIdService = async (
  organisationId,
  campaignId
) => {
  try {
    const org = await getOrganisationById(
      masterAuthDB,
      organisationId
    );

    if (!org) {
      return {
        success: false,
        message: "Organisation not found",
      };
    }

    const db = getDB(org.org_type);
    const schema = org.schema_name;

    const row = await model.getCampaignById(
      db,
      schema,
      campaignId
    );

    if (!row) {
      return {
        success: false,
        message: "Campaign not found",
      };
    }

    return {
      success: true,
      data: {
        id: String(row.id),
        campaignName: row.campaign_name,
        channel: row.channel,
        category: row.category,
        subject: row.subject,
        preheader: row.preheader,
        status: row.status,
        scheduledAt: row.scheduled_at,
        createdBy: row.created_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
};

// ===================== CREATE CAMPAIGN =====================

export const createCampaignService = async (
  organisationId,
  payload,
  userId
) => {
  try {
    const org = await getOrganisationById(
      masterAuthDB,
      organisationId
    );

    if (!org) {
      return {
        success: false,
        message: "Organisation not found",
      };
    }

    if (!payload.campaign_name?.trim()) {
      return {
        success: false,
        message: "Campaign name is required",
      };
    }

    const db = getDB(org.org_type);
    const schema = org.schema_name;

    const row = await model.createCampaign(
      db,
      schema,
      {
        campaign_name: payload.campaign_name.trim(),
        channel: payload.channel || "Email",
        category: payload.category || "Others",
        subject: payload.subject || null,
        preheader: payload.preheader || null,
        status: payload.status || "Draft",
        scheduled_at: payload.scheduled_at || null,
        created_by: userId || null,
      }
    );

    return {
      success: true,
      message: "Campaign created successfully",
      data: {
        id: String(row.id),
        campaignName: row.campaign_name,
        channel: row.channel,
        category: row.category,
        subject: row.subject,
        preheader: row.preheader,
        status: row.status,
        scheduledAt: row.scheduled_at,
        createdBy: row.created_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
};

// ===================== UPDATE CAMPAIGN =====================

export const updateCampaignService = async (
  organisationId,
  campaignId,
  payload
) => {
  try {
    const org = await getOrganisationById(
      masterAuthDB,
      organisationId
    );

    if (!org) {
      return {
        success: false,
        message: "Organisation not found",
      };
    }

    if (!payload.campaign_name?.trim()) {
      return {
        success: false,
        message: "Campaign name is required",
      };
    }

    const db = getDB(org.org_type);
    const schema = org.schema_name;

    const row = await model.updateCampaign(
      db,
      schema,
      campaignId,
      {
        campaign_name: payload.campaign_name.trim(),
        channel: payload.channel || "Email",
        category: payload.category || "Others",
        subject: payload.subject || null,
        preheader: payload.preheader || null,
        status: payload.status || "Draft",
        scheduled_at: payload.scheduled_at || null,
      }
    );

    if (!row) {
      return {
        success: false,
        message: "Campaign not found",
      };
    }

    return {
      success: true,
      message: "Campaign updated successfully",
      data: {
        id: String(row.id),
        campaignName: row.campaign_name,
        channel: row.channel,
        category: row.category,
        subject: row.subject,
        preheader: row.preheader,
        status: row.status,
        scheduledAt: row.scheduled_at,
        createdBy: row.created_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
};

// ===================== DELETE CAMPAIGN =====================

export const deleteCampaignService = async (
  organisationId,
  campaignId
) => {
  try {
    const org = await getOrganisationById(
      masterAuthDB,
      organisationId
    );

    if (!org) {
      return {
        success: false,
        message: "Organisation not found",
      };
    }

    const db = getDB(org.org_type);
    const schema = org.schema_name;

    const row = await model.deleteCampaign(
      db,
      schema,
      campaignId
    );

    if (!row) {
      return {
        success: false,
        message: "Campaign not found",
      };
    }

    return {
      success: true,
      message: "Campaign deleted successfully",
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
};