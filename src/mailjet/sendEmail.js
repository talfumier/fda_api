import Mailjet from "node-mailjet";
import {environment} from "../config/environment.js";
import {InternalServerError} from "../mariadb/models/validation/errors.js";
import {Success} from "../mariadb/models/validation/success.js";

const mailjet = new Mailjet({
  apiKey: environment.mail_jet_api_key,
  apiSecret: environment.mail_jet_api_secret,
});

export function sendBasicEmail(
  recipient,
  name,
  subject,
  htmlPart,
  cc = false, //sender receives a copy in its inbox when set to true
  attachments = null,
  res = null,
  callback_success = null
) {
  let msgBody = {
    From: {
      Email: environment.mail_jet_sender,
      Name: name,
    },
    To: [
      {
        Email: recipient,
        Name: recipient,
      },
    ],
    Subject: subject,
    HTMLPart: htmlPart,
  };
  if (cc)
    msgBody = {
      ...msgBody,
      Cc: [
        {
          Email: environment.mail_jet_sender,
          Name: environment.mail_jet_sender,
        },
      ],
    };
  if (attachments) msgBody = {...msgBody, Attachments: attachments};
  mailjet
    .post("send", {version: "v3.1"})
    .request({
      Messages: [msgBody],
    })
    .then((resolved) => {
      console.log({success: true, email: recipient});
      if (res)
        emailCallBack(
          recipient,
          null, //no error
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
    res.send(
      new Success(
        success_msg
          ? success_msg
          : `✅ email delivery to ${email} successful !`,
        null,
        success_msg ? true : false
      )
    );
}
