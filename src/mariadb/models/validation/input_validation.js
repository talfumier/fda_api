import Joi from "joi";
import {joiPasswordExtendCore} from "joi-password";

function makeValidator(schema, data, cs = "post") {
  if (cs === "patch") {
    const keys = Object.keys(data);
    const patchSchema = schema.fork(keys, (field) => field.optional());
    return patchSchema.validate(data);
  }
  return schema.validate(data);
}
export function validateBooking(data, cs = "post") {
  const schema = Joi.object({
    idUser: Joi.number().integer().required(),
    idExpo: Joi.number().integer().required(),
    idStatus: Joi.number().integer().required(),
    vernissage: Joi.number().integer().valid(0, 1).allow(null),
    lunch: Joi.number().integer().valid(0, 1).allow(null),
  });
  return makeValidator(schema, data, cs);
}
export function validateDoc(data, cs = "post") {
  const schema = Joi.object({
    standalone: Joi.number().integer().valid(0, 1).allow(null),
    name_fr: Joi.string().allow(null),
    name_en: Joi.string().allow(null),
    desc_fr: Joi.string().allow(null),
    desc_en: Joi.string().allow(null),
    url: Joi.string().allow(null),
  });
  return makeValidator(schema, data, cs);
}
export function validateDomain(data, cs = "post") {
  const schema = Joi.object({
    domain_fr: Joi.string().allow(null),
    domain_en: Joi.string().allow(null),
  });
  return makeValidator(schema, data, cs);
}
export function validateExpo(data, cs = "post") {
  const schema = Joi.object({
    title_en: Joi.string().allow(null),
    title_fr: Joi.string().allow(null),
    desc_en: Joi.string().allow(null),
    desc_fr: Joi.string().allow(null),
    start_date: Joi.date().required(),
    end_date: Joi.date().required(),
    address: Joi.string().allow(null),
    zipCode: Joi.string().allow(null),
    city: Joi.string().allow(null),
    country: Joi.string().allow(null),
    gpsLat: Joi.number().allow(null),
    gpsLong: Joi.number().allow(null),
    depotDateTime_open: Joi.date().required(),
    depotDateTime_close: Joi.date().required(),
    vernissageDateTime: Joi.date().required(),
    lunchDateTime: Joi.date().required(),
    priceShowRoom: Joi.number().allow(null),
    priceScreen: Joi.number().allow(null),
    archived: Joi.number().integer().valid(0, 1).allow(null),
  });
  return makeValidator(schema, data, cs);
}
export function validateImage(data, cs = "post") {
  const schema = Joi.object({
    title_fr: Joi.string().allow(null),
    title_en: Joi.string().allow(null),
    url: Joi.string().allow(null),
    data: Joi.any().allow(null),
  });
  return makeValidator(schema, data, cs);
}
export function validateMedia(data, cs = "post") {
  const schema = Joi.object({
    media_fr: Joi.string().allow(null),
    media_en: Joi.string().allow(null),
  });
  return makeValidator(schema, data, cs);
}
export function validateOeuvre(data, cs = "post") {
  const schema = Joi.object({
    classic: Joi.number().integer().valid(0, 1).allow(null),
    modern: Joi.number().integer().valid(0, 1).allow(null),
    idDomainTechMedia: Joi.number().integer().required(),
    title_fr: Joi.string().allow(null),
    title_en: Joi.string().allow(null),
    desc_fr: Joi.string().allow(null),
    desc_en: Joi.string().allow(null),
    completionDate: Joi.date().allow(null),
    price: Joi.number().allow(null),
    reserved: Joi.number().integer().valid(0, 1).allow(null),
    width: Joi.number().allow(null),
    height: Joi.number().allow(null),
    depth: Joi.number().allow(null),
    weight: Joi.number().allow(null),
    idImage: Joi.number().integer().required(),
  });
  return makeValidator(schema, data, cs);
}
export function validatePartner(data, cs = "post") {
  const schema = Joi.object({
    name: Joi.string().allow(null),
    address: Joi.string().allow(null),
    zipCode: Joi.string().allow(null),
    city: Joi.string().allow(null),
    country: Joi.string().allow(null),
    idImage: Joi.number().integer().required(),
    idUser: Joi.number().integer().allow(null),
  });
  return makeValidator(schema, data, cs);
}
export function validatePrize(data, cs = "post") {
  const schema = Joi.object({
    prize_fr: Joi.string().allow(null),
    prize_en: Joi.string().allow(null),
  });
  return makeValidator(schema, data, cs);
}
export function validateRole(data, cs = "post") {
  const schema = Joi.object({
    role_fr: Joi.string().allow(null),
    role_en: Joi.string().allow(null),
  });
  return makeValidator(schema, data, cs);
}
export function validateStatus(data, cs = "post") {
  const schema = Joi.object({
    type: Joi.string().allow(null),
    title_fr: Joi.string().allow(null),
    title_en: Joi.string().allow(null),
    createdAt: Joi.date().allow(null),
    updatedAt: Joi.date().allow(null),
  });
  return makeValidator(schema, data, cs);
}
export function validateTechnique(data, cs = "post") {
  const schema = Joi.object({
    technique_fr: Joi.string().allow(null),
    technique_en: Joi.string().allow(null),
  });
  return makeValidator(schema, data, cs);
}
export function validateUser(data, cs = "post") {  
  const joiPassword = Joi.extend(joiPasswordExtendCore);
  const schema = Joi.object({
    idRole: Joi.number().integer().required(),
    idStatus: Joi.number().integer().allow(null),   //default value 1 (pending) set in sqlModels
    lastName: Joi.string().allow(null),
    firstName: Joi.string().allow(null),
    pseudo: Joi.string().allow(null),
    display: Joi.number().integer().valid(0, 1).allow(null),   //default value 2 (all) set in sqlModels
    public: Joi.number().integer().valid(0, 1).allow(null),   //default value 1 (true) set in sqlModels
    email: Joi.string().email().required(),
    phone: Joi.string().allow(null),
    lang: Joi.string().allow(null),   //default value 1 (fr) set in sqlModels
    address: Joi.string().allow(null),
    zipCode: Joi.string().allow(null),
    city: Joi.string().allow(null),
    country: Joi.string().allow(null),
    resume_fr: Joi.string().allow(null),
    resume_en: Joi.string().allow(null),
    idImage: Joi.number().integer().allow(null),
    web1: Joi.string().allow(null),
    web2: Joi.string().allow(null),
    social1: Joi.string().allow(null),
    social2: Joi.string().allow(null),
    newsletter: Joi.number().integer().valid(0, 1).allow(null),   //default value 1 (true) set in sqlModels  
    pwd: joiPassword
      .string(),
      // .min(8)
      // .max(60)
      // .minOfSpecialCharacters(1)
      // .minOfUppercase(1)
      // .minOfNumeric(1)
      // .noWhiteSpaces(),
  });
  return makeValidator(schema, data, cs);
}
