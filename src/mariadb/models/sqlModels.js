import * as val from "./validation/input_validation.js";

let modelCache = new WeakMap();
export function getModels(sequelize, id = null) {
  return !id ? modelCache.get(sequelize) : modelCache.get(sequelize)[id];
}
export function deleteConnection(sequelize) {
  modelCache.delete(sequelize);
}
export const defineSqlModels = (sequelize, DataTypes, sync = false) => {
  if (!sync && modelCache.has(sequelize)) return;
  if (sync && modelCache.has(sequelize)) deleteConnection(sequelize);
  const models = {};

  models.booking = {
    validate: val.validateBooking,
    master: null,
    model: sequelize.define(
      "Booking",
      {
        idBooking: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        idExpo: DataTypes.INTEGER,
        status: DataTypes.STRING,
        vernissage: DataTypes.BOOLEAN,
        lunch: DataTypes.BOOLEAN,
      },
      {tableName: "tbooking", timestamps: true}
    ),
  };
  models.bookingOeuvre = {
    validate: null,
    master: null,
    model: sequelize.define(
      "BookingOeuvre",
      {
        idBookingOeuvre: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        idBooking: DataTypes.INTEGER,
        idOeuvre: DataTypes.INTEGER,
        showRoom: DataTypes.BOOLEAN,
        screen: DataTypes.BOOLEAN,
      },
      {tableName: "tbooking_oeuvre", timestamps: true}
    ),
  };
  models.doc = {
    validate: val.validateDoc,
    master: "name_",
    model: sequelize.define(
      "Doc",
      {
        idDoc: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        standalone: DataTypes.BOOLEAN,
        name_fr: DataTypes.STRING,
        name_en: DataTypes.STRING,
        desc_fr: DataTypes.TEXT,
        desc_en: DataTypes.TEXT,
        url: DataTypes.STRING,
      },
      {tableName: "tdoc", timestamps: true}
    ),
  };
  models.domain = {
    validate: val.validateDomain,
    master: "domain_",
    model: sequelize.define(
      "Domain",
      {
        idDomain: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        domain_fr: DataTypes.STRING,
        domain_en: DataTypes.STRING,
      },
      {tableName: "tdomain", timestamps: true}
    ),
  };
  models.domainTech = {
    validate: null,
    master: null,
    model: sequelize.define(
      "DomainTech",
      {
        idDomainTech: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        idDomain: DataTypes.INTEGER,
        idTech: DataTypes.INTEGER,
      },
      {tableName: "tdomain_technique", timestamps: true}
    ),
  };
  models.domainTechMedia = {
    validate: null,
    master: null,
    model: sequelize.define(
      "DomainTechMedia",
      {
        idDomainTechMedia: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        idDomainTech: DataTypes.INTEGER,
        idMedia: DataTypes.INTEGER,
      },
      {tableName: "tdomain_technique_media", timestamps: true}
    ),
  };
  models.expo = {
    validate: val.validateExpo,
    master: "title_",
    model: sequelize.define(
      "Expo",
      {
        idExpo: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        title_en: DataTypes.STRING,
        title_fr: DataTypes.STRING,
        desc_fr: DataTypes.TEXT,
        desc_en: DataTypes.TEXT,
        start_date: DataTypes.DATE,
        end_date: DataTypes.DATE,
        address: DataTypes.STRING,
        zipCode: DataTypes.STRING,
        city: DataTypes.STRING,
        country: DataTypes.STRING,
        gpsLat: DataTypes.FLOAT,
        gpsLong: DataTypes.FLOAT,
        depotDateTime_open: DataTypes.DATE,
        depotDateTime_close: DataTypes.DATE,
        vernissageDateTime: DataTypes.DATE,
        lunchDateTime: DataTypes.DATE,
        priceShowRoom: DataTypes.FLOAT,
        priceScreen: DataTypes.FLOAT,
        archived: DataTypes.BOOLEAN,
        updated: {type: DataTypes.DATE, defaultValue: sequelize.NOW},
      },
      {tableName: "texpo", timestamps: true}
    ),
  };
  models.expoDoc = {
    validate: null,
    master: null,
    model: sequelize.define(
      "ExpoDoc",
      {
        idExpoDoc: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        idExpo: DataTypes.INTEGER,
        idDoc: DataTypes.INTEGER,
      },
      {tableName: "texpo_doc", timestamps: true}
    ),
  };
  models.expoImage = {
    validate: null,
    master: null,
    model: sequelize.define(
      "ExpoImage",
      {
        idExpoImage: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        idExpo: DataTypes.INTEGER,
        idImage: DataTypes.INTEGER,
      },
      {tableName: "texpo_image", timestamps: true}
    ),
  };
  models.expoPartner = {
    validate: null,
    master: null,
    model: sequelize.define(
      "ExpoPartner",
      {
        idExpoPartner: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        idExpo: DataTypes.INTEGER,
        idPartner: DataTypes.INTEGER,
      },
      {tableName: "texpo_partner", timestamps: true}
    ),
  };
  models.expoPrizeUser = {
    validate: null,
    master: null,
    model: sequelize.define(
      "ExpoPrizeUser",
      {
        idExpoPrizeUser: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        idExpo: DataTypes.INTEGER,
        idPrizeDomain: DataTypes.INTEGER,
        idUser: DataTypes.INTEGER,
      },
      {tableName: "texpo_prize_user", timestamps: true}
    ),
  };
  models.image = {
    validate: val.validateImage,
    master: "title_",
    model: sequelize.define(
      "Image",
      {
        idImage: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        title_fr: DataTypes.STRING,
        title_en: DataTypes.STRING,
        url: DataTypes.STRING,
        data: DataTypes.BLOB,
      },
      {tableName: "timage", timestamps: true}
    ),
  };
  models.media = {
    validate: val.validateMedia,
    master: "media_",
    model: sequelize.define(
      "Media",
      {
        idMedia: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        media_fr: DataTypes.STRING,
        media_en: DataTypes.STRING,
      },
      {tableName: "tmedia", timestamps: true}
    ),
  };
  models.oeuvre = {
    validate: val.validateOeuvre,
    master: "title_",
    model: sequelize.define(
      "Oeuvre",
      {
        idOeuvre: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        classic: DataTypes.BOOLEAN,
        modern: DataTypes.BOOLEAN,
        idDomainTechMedia: DataTypes.INTEGER,
        title_fr: DataTypes.STRING,
        title_en: DataTypes.STRING,
        desc_fr: DataTypes.TEXT,
        desc_en: DataTypes.TEXT,
        completionDate: DataTypes.DATE,
        price: DataTypes.FLOAT,
        reserved: DataTypes.BOOLEAN,
        width: DataTypes.FLOAT,
        height: DataTypes.FLOAT,
        depth: DataTypes.FLOAT,
        weight: DataTypes.FLOAT,
        idImage: DataTypes.INTEGER,
      },
      {tableName: "toeuvre", timestamps: true}
    ),
  };
  models.partner = {
    validate: val.validatePartner,
    master: "name",
    model: sequelize.define(
      "Partner",
      {
        idPartner: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: DataTypes.STRING,
        address: DataTypes.STRING,
        zipCode: DataTypes.STRING,
        city: DataTypes.STRING,
        country: DataTypes.STRING,
        idImage: DataTypes.INTEGER,
        idUser: DataTypes.INTEGER,
      },
      {tableName: "tpartner", timestamps: true}
    ),
  };
  models.prize = {
    validate: val.validatePrize,
    master: "prize_",
    model: sequelize.define(
      "Prize",
      {
        idPrize: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        prize_fr: DataTypes.STRING,
        prize_en: DataTypes.STRING,
      },
      {tableName: "tprize", timestamps: true}
    ),
  };
  models.prizeDomain = {
    validate: null,
    master: null,
    model: sequelize.define(
      "PrizeDomain",
      {
        idPrize: DataTypes.INTEGER,
        idDomain: DataTypes.INTEGER,
      },
      {tableName: "tprize_domain", timestamps: true}
    ),
  };
  models.role = {
    validate: val.validateRole,
    master: "role_",
    model: sequelize.define(
      "Role",
      {
        idRole: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        role_fr: DataTypes.STRING,
        role_en: DataTypes.STRING,
      },
      {tableName: "trole", timestamps: true}
    ),
  };
  models.status = {
    validate: val.validateStatus,
    master: "type",
    model: sequelize.define(
      "Status",
      {
        idStatus: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        type: DataTypes.STRING,
        title_fr: DataTypes.STRING,
        title_en: DataTypes.STRING,
      },
      {tableName: "tstatus", timestamps: true}
    ),
  };
  models.technique = {
    validate: val.validateTechnique,
    master: "technique_",
    model: sequelize.define(
      "Technique",
      {
        idTech: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        technique_fr: DataTypes.STRING,
        technique_en: DataTypes.STRING,
      },
      {tableName: "ttechnique", timestamps: true}
    ),
  };
  models.user = {
    validate: val.validateUser,
    master: "lastName",
    model: sequelize.define(
      "User",
      {
        idUser: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        idStatus: DataTypes.INTEGER,
        lastName: DataTypes.STRING,
        firstName: DataTypes.STRING,
        pseudo: DataTypes.STRING,
        display: DataTypes.STRING,
        public: DataTypes.BOOLEAN,
        email: DataTypes.STRING,
        phone: DataTypes.STRING,
        lang: DataTypes.STRING,
        address: DataTypes.STRING,
        zipCode: DataTypes.STRING,
        city: DataTypes.STRING,
        country: DataTypes.STRING,
        resume_fr: DataTypes.TEXT,
        resume_en: DataTypes.TEXT,
        idImage: DataTypes.INTEGER,
        web1: DataTypes.STRING,
        web2: DataTypes.STRING,
        social1: DataTypes.STRING,
        social2: DataTypes.STRING,
        newsletter: DataTypes.BOOLEAN,
      },
      {tableName: "tuser", timestamps: true}
    ),
  };
  models.userExpo = {
    validate: null,
    master: null,
    model: sequelize.define(
      "UserExpo",
      {
        idUserExpo: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        idUser: DataTypes.INTEGER,
        idExpo: DataTypes.INTEGER,
      },
      {tableName: "tuser_expo", timestamps: true}
    ),
  };
  models.userRole = {
    validate: null,
    master: null,
    model: sequelize.define(
      "UserRole",
      {
        idUserRole: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        idUser: DataTypes.INTEGER,
        idRole: DataTypes.INTEGER,
      },
      {tableName: "tuser_role", timestamps: true}
    ),
  };
  // User relationships
  models.user.model.belongsTo(models.status.model, {foreignKey: "idStatus"});
  models.user.model.belongsTo(models.image.model, {foreignKey: "idImage"});
  models.user.model.hasMany(models.userRole.model, {foreignKey: "idUser"});
  models.user.model.hasMany(models.userExpo.model, {foreignKey: "idUser"});
  models.user.model.hasMany(models.booking.model, {foreignKey: "idUser"});
  models.user.model.hasMany(models.partner.model, {foreignKey: "idUser"});
  models.user.model.hasMany(models.expoPrizeUser.model, {foreignKey: "idUser"});
  // Role/UserRole relationships
  models.userRole.model.belongsTo(models.user.model, {foreignKey: "idUser"});
  models.userRole.model.belongsTo(models.role.model, {foreignKey: "idRole"});
  // Expo/UserExpo relationships
  models.userExpo.model.belongsTo(models.user.model, {foreignKey: "idUser"});
  models.userExpo.model.belongsTo(models.expo.model, {foreignKey: "idExpo"});
  // Booking relationships
  models.booking.model.belongsTo(models.user.model, {foreignKey: "idUser"});
  models.booking.model.belongsTo(models.expo.model, {foreignKey: "idExpo"});
  models.booking.model.belongsTo(models.status.model, {foreignKey: "idStatus"});
  models.booking.model.hasMany(models.bookingOeuvre.model, {
    foreignKey: "idBooking",
  });
  // BookingOeuvre relationships
  models.bookingOeuvre.model.belongsTo(models.booking.model, {
    foreignKey: "idBooking",
  });
  models.bookingOeuvre.model.belongsTo(models.oeuvre.model, {
    foreignKey: "idOeuvre",
  });
  models.bookingOeuvre.model.belongsTo(models.status.model, {
    foreignKey: "idStatus",
  });
  // Oeuvre relationships
  models.oeuvre.model.belongsTo(models.domainTechMedia.model, {
    foreignKey: "idDomainTechMedia",
  });
  models.oeuvre.model.belongsTo(models.image.model, {foreignKey: "idImage"});
  // DomainTechMedia relationships
  models.domainTechMedia.model.belongsTo(models.domainTech.model, {
    foreignKey: "idDomainTech",
  });
  models.domainTechMedia.model.belongsTo(models.media.model, {
    foreignKey: "idMedia",
  });
  // DomainTech  relationships
  models.domainTech.model.belongsTo(models.domain.model, {
    foreignKey: "idDomain",
  });
  models.domainTech.model.belongsTo(models.technique.model, {
    foreignKey: "idTech",
  });
  // Expo relationships
  models.expo.model.hasMany(models.expoImage.model, {foreignKey: "idExpo"});
  models.expo.model.hasMany(models.expoDoc.model, {foreignKey: "idExpo"});
  models.expo.model.hasMany(models.expoPartner.model, {foreignKey: "idExpo"});
  models.expo.model.hasMany(models.expoPrizeUser.model, {foreignKey: "idExpo"});
  // ExpoImage relationships
  models.expoImage.model.belongsTo(models.expo.model, {foreignKey: "idExpo"});
  models.expoImage.model.belongsTo(models.image.model, {foreignKey: "idImage"});
  // ExpoDoc relationships
  models.expoDoc.model.belongsTo(models.expo.model, {foreignKey: "idExpo"});
  models.expoDoc.model.belongsTo(models.doc.model, {foreignKey: "idDoc"});
  // ExpoPartner relationships
  models.expoPartner.model.belongsTo(models.expo.model, {foreignKey: "idExpo"});
  models.expoPartner.model.belongsTo(models.partner.model, {
    foreignKey: "idPartner",
  });
  // ExpoPrizeUser  relationships
  models.expoPrizeUser.model.belongsTo(models.expo.model, {
    foreignKey: "idExpo",
  });
  models.expoPrizeUser.model.belongsTo(models.user.model, {
    foreignKey: "idUser",
  });
  models.expoPrizeUser.model.belongsTo(models.prizeDomain.model, {
    foreignKey: "idPrizeDomain",
  });
  // PrizeDomain relationships
  models.prizeDomain.model.belongsTo(models.prize.model, {
    foreignKey: "idPrize",
  });
  models.prizeDomain.model.belongsTo(models.domain.model, {
    foreignKey: "idDomain",
  });
  // Partner relationships
  models.partner.model.belongsTo(models.user.model, {foreignKey: "idUser"});
  models.partner.model.belongsTo(models.image.model, {foreignKey: "idImage"});

  modelCache.set(sequelize, models);
};
