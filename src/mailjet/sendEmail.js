import Mailjet from "node-mailjet";
import {environment} from "../config/environment.js";
import {InternalServerError} from "../mariadb/models/validation/errors.js";

const mailjet = new Mailjet({
  apiKey: environment.mail_jet_api_key,
  apiSecret: environment.mail_jet_api_secret,
});

export function sendBasicEmail(
  recipient,
  subject,
  htmlPart,
  res = null,
  callback_success = null
) {
  mailjet
    .post("send", {version: "v3.1"})
    .request({
      Messages: [
        {
          From: {
            Email: environment.mail_jet_sender,
            Name: "FestivalDesArts mailbox: do not reply",
          },
          To: [
            {
              Email: recipient,
              Name: recipient,
            },
          ],
          Subject: subject,
          HTMLPart: htmlPart,
        },
      ],
    })
    .then((resolved) => {
      console.log({success: true, email: recipient});
      if (res)
        emailCallBack(
          recipient,
          null,
          res,
          callback_success ? callback_success : null
        );
    })
    .catch((error) => {
      console.log({success: false, email: recipient, error});
      if (res) emailCallBack(recipient, error, res);
    });
}
export function emailCallBack(email, err, res, success_msg = null) {
  if (err)
    res.send(
      new InternalServerError(`❌ Unable to deliver email to user ${email} !`)
    );
  else
    res.send({
      statusCode: "200",
      message: !success_msg
        ? `✅ email delivery to ${email} successful !`
        : success_msg,
    });
}
