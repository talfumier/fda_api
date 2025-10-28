import Joi from "joi";
import {joiPasswordExtendCore} from "joi-password";
// SQL MODELS VALIDATION FUNCTIONS
function makeValidator(schema, data, cs = "post", tblName = null) {
  const dataKeys = Object.keys(data);
  let keys = {required: [], optional: []}; //contains mandatory fields to be validated and optional ones that can be missing
  switch (cs) {
    case "postForgotPwd":
    case "patch": //as soon as a field is present in the request body, it has to be considered mandatory to ensure proper validation
      keys.required = [...dataKeys]; //all keys in request body are required
      if (tblName === "tuser" && dataKeys.indexOf("email") === -1)
        keys.optional.push("email");
      let patchSchema = schema.fork(keys.required, (field) => field.required());
      if (keys.optional.length >= 1)
        patchSchema = patchSchema.fork(keys.optional, (field) =>
          field.optional()
        );
      return patchSchema.validate(data);
    default:
      return schema.validate(data);
  }
}
export function validateBooking(data, cs = "post") {
  const schema = Joi.object({
    idExpo: Joi.number().integer(),
    idUser: Joi.number().integer(),
    vernissage: Joi.number().integer().valid(0, 1).allow(null),
    lunch: Joi.number().integer().valid(0, 1).allow(null),
    price: Joi.number().integer().allow(null),
    terms: Joi.number().integer().valid(0, 1).allow(null),
  });
  return makeValidator(schema, data, cs);
}
export function validateBookingOeuvre(data, cs = "post") {
  const schema = Joi.object({
    idBooking: Joi.number().integer(),
    idOeuvre: Joi.number().integer(),
    showRoom: Joi.number().integer().valid(0, 1).allow(null),
    screen: Joi.number().integer().valid(0, 1).allow(null),
  });
  return makeValidator(schema, data, cs);
}
export function validateDoc(data, cs = "post") {
  const schema = Joi.object({
    standalone: Joi.number().integer().valid(0, 1).allow(null),
    name_fr: Joi.string().required(),
    name_en: Joi.string().required(),
    desc_fr: Joi.string().allow(null),
    desc_en: Joi.string().allow(null),
    url: Joi.string().allow(null),
  });
  return makeValidator(schema, data, cs);
}
export function validateDomain(data, cs = "post") {
  const schema = Joi.object({
    domain_fr: Joi.string().required(),
    domain_en: Joi.string().required(),
    order: Joi.number().required(),
  });
  return makeValidator(schema, data, cs);
}
export function validateExpo(data, cs = "post") {
  const schema = Joi.object({
    short_fr: Joi.string().allow(null, ""),
    short_en: Joi.string().allow(null, ""),
    title_en: Joi.string().allow(null, ""),
    title_fr: Joi.string().allow(null, ""),
    desc_en: Joi.string().allow(null, ""),
    desc_fr: Joi.string().allow(null, ""),
    startDate: Joi.date().allow(null),
    endDate: Joi.date().allow(null),
    address: Joi.string().allow(null, ""),
    zipCode: Joi.string().allow(null, ""),
    city: Joi.string().allow(null, ""),
    country: Joi.string().allow(null, ""),
    gpsLat: Joi.string().allow(null, ""),
    gpsLong: Joi.string().allow(null, ""),
    closureDateTime: Joi.date().allow(null),
    depotDateTime_open: Joi.date().allow(null),
    depotDateTime_close: Joi.date().allow(null),
    collectionDateTime_open: Joi.date().allow(null),
    collectionDateTime_close: Joi.date().allow(null),
    vernissageDateTime: Joi.date().allow(null),
    lunchDateTime: Joi.date().allow(null),
    priceShowRoom: Joi.number().allow(null, ""),
    priceScreen: Joi.number().allow(null, ""),
  });
  return makeValidator(schema, data, cs);
}
export function validateImage(data, cs = "post") {
  const schema = Joi.object({
    idImage: Joi.number().required(),
    fileName: Joi.string().required(),
    fileSize: Joi.number().allow(null),
    fileLastModified: Joi.date(),
    url: Joi.string().required(),
  });
  return makeValidator(schema, data, cs);
}
export function validateMedia(data, cs = "post") {
  const schema = Joi.object({
    media_fr: Joi.string().required(),
    media_en: Joi.string().required(),
    order: Joi.number().required(),
  });
  return makeValidator(schema, data, cs);
}
export function validateOeuvre(data, cs = "post") {
  const schema = Joi.object({
    idUser: Joi.number().integer(),
    classic_modern: Joi.number().integer().valid(0, 1),
    idDomain: Joi.number().allow(null),
    idTech: Joi.number().allow(null),
    idMedia: Joi.number().allow(null),
    title_fr: Joi.string().allow(null, ""),
    title_en: Joi.string().allow(null, ""),
    desc_fr: Joi.string().allow(null, ""),
    desc_en: Joi.string().allow(null, ""),
    completionDate: Joi.date().allow(null),
    price: Joi.number().allow(null),
    reserved: Joi.number().integer().valid(0, 1),
    width: Joi.number().allow(null),
    height: Joi.number().allow(null),
    depth: Joi.number().allow(null),
    weight: Joi.number().allow(null),
    idImage: Joi.number().allow(null),
  });
  return makeValidator(schema, data, cs);
}
export function validatePartner(data, cs = "post") {
  const schema = Joi.object({
    short: Joi.string().allow(null),
    name: Joi.string().allow(null),
    address: Joi.string().allow(null, ""),
    zipCode: Joi.string().allow(null, ""),
    city: Joi.string().allow(null, ""),
    country: Joi.string().allow(null, ""),
    resume_fr: Joi.string().allow(null, ""),
    resume_en: Joi.string().allow(null, ""),
    idImage: Joi.number().integer().allow(null),
    web1: Joi.string().allow(null),
    web2: Joi.string().allow(null),
    social1: Joi.string().allow(null),
    social2: Joi.string().allow(null),
    lastNameRep: Joi.string().allow(null),
    firstNameRep: Joi.string().allow(null),
    emailRep: Joi.string().email().allow(null),
    phoneRep: Joi.string().allow(null),
  });
  return makeValidator(schema, data, cs);
}
export function validatePrize(data, cs = "post") {
  const schema = Joi.object({
    prize_fr: Joi.string().required(),
    prize_en: Joi.string().required(),
    order: Joi.number().required(),
  });
  return makeValidator(schema, data, cs);
}
export function validateRole(data, cs = "post") {
  const schema = Joi.object({
    role_fr: Joi.string().required(),
    role_en: Joi.string().required(),
    account: Joi.number().integer().valid(0, 1),
    roleExpo: Joi.number().integer().valid(0, 1),
  });
  return makeValidator(schema, data, cs);
}
export function validateStatus(data, cs = "post") {
  const schema = Joi.object({
    type: Joi.string().allow(null),
    title_fr: Joi.string().required(),
    title_en: Joi.string().required(),
    createdAt: Joi.date().allow(null),
    updatedAt: Joi.date().allow(null),
  });
  return makeValidator(schema, data, cs);
}
export function validateTechnique(data, cs = "post") {
  const schema = Joi.object({
    tech_fr: Joi.string().required(),
    tech_en: Joi.string().required(),
    order: Joi.number().required(),
  });
  return makeValidator(schema, data, cs);
}
export function validateUser(data, cs = "post") {
  const joiPassword = Joi.extend(joiPasswordExtendCore);
  const schema = Joi.object({
    idRole: Joi.number().integer().allow(null), //default value 1 (artist) set in sqlModels
    lastName: Joi.string().allow(null),
    firstName: Joi.string().allow(null),
    public_name: Joi.number().integer().valid(0, 1).allow(null), //default value 1 (true) set in sqlModels
    pseudo: Joi.string().allow(null),
    public_pseudo: Joi.number().integer().valid(0, 1).allow(null), //default value 0 (false) set in sqlModels
    email: Joi.string().email().required(),
    public_email: Joi.number().integer().valid(0, 1).allow(null), //default value 0 (false) set in sqlModels
    phone: Joi.string().allow(null),
    public_phone: Joi.number().integer().valid(0, 1).allow(null), //default value 0 (false) set in sqlModels
    lang: Joi.string().allow(null), //default value 1 (fr) set in sqlModels
    address: Joi.string().allow(null),
    zipCode: Joi.string().allow(null),
    city: Joi.string().allow(null),
    country: Joi.string().allow(null),
    resume_fr: Joi.string().allow(null),
    resume_en: Joi.string().allow(null),
    idImage: Joi.number().integer().allow(null),
    public_image: Joi.number().integer().valid(0, 1).allow(null), //default value 1 (true) set in sqlModels
    web1: Joi.string().allow(null),
    web2: Joi.string().allow(null),
    social1: Joi.string().allow(null),
    social2: Joi.string().allow(null),
    newsletter: Joi.number().integer().valid(0, 1).allow(null), //default value 1 (true) set in sqlModels
    cgu_cgv: Joi.date, //default value current timestamp set in sqlModels
    pwd: joiPassword
      .string()
      .min(8)
      .max(60)
      .minOfSpecialCharacters(1)
      .minOfUppercase(1)
      .minOfNumeric(1)
      .noWhiteSpaces(),
  });
  return makeValidator(schema, data, cs, "tuser");
}
