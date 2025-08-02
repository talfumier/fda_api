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

  models.Booking = {
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
  models.BookingOeuvre = {
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
      {
        tableName: "tbooking_oeuvre",
        timestamps: true,
        createdAt: true,
        updatedAt: false,
      }
    ),
  };
  models.Doc = {
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
  models.Domain = {
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
  models.DomainTech = {
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
      {
        tableName: "tdomain_technique",
        timestamps: true,
        createdAt: true,
        updatedAt: false,
      }
    ),
  };
  models.DomainTechMedia = {
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
      {
        tableName: "tdomain_technique_media",
        timestamps: true,
        createdAt: true,
        updatedAt: false,
      }
    ),
  };
  models.Expo = {
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
      },
      {tableName: "texpo", timestamps: true}
    ),
  };
  models.ExpoDoc = {
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
      {
        tableName: "texpo_doc",
        timestamps: true,
        createdAt: true,
        updatedAt: false,
      }
    ),
  };
  models.ExpoImage = {
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
      {
        tableName: "texpo_image",
        timestamps: true,
        createdAt: true,
        updatedAt: false,
      }
    ),
  };
  models.ExpoPartner = {
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
      {
        tableName: "texpo_partner",
        timestamps: true,
        createdAt: true,
        updatedAt: false,
      }
    ),
  };
  models.ExpoPrizeUser = {
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
      {
        tableName: "texpo_prize_user",
        timestamps: true,
        createdAt: true,
        updatedAt: false,
      }
    ),
  };
  models.Image = {
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
  models.Media = {
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
  models.Oeuvre = {
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
  models.Partner = {
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
  models.Prize = {
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
  models.PrizeDomain = {
    validate: null,
    master: null,
    model: sequelize.define(
      "PrizeDomain",
      {
        idPrize: DataTypes.INTEGER,
        idDomain: DataTypes.INTEGER,
      },
      {
        tableName: "tprize_domain",
        timestamps: true,
        createdAt: true,
        updatedAt: false,
      }
    ),
  };
  models.Role = {
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
        account: DataTypes.BOOLEAN,
        roleExpo: DataTypes.BOOLEAN,
      },
      {tableName: "trole", timestamps: true}
    ),
  };
  models.Status = {
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
  models.Technique = {
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
  models.User = {
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
        idRole: {type: DataTypes.INTEGER, defaultValue: 1}, //account related roles, 0 >> artist
        idStatus: {type: DataTypes.INTEGER, defaultValue: 1}, // 1 >> user pending validation
        lastName: DataTypes.STRING,
        firstName: DataTypes.STRING,
        pseudo: DataTypes.STRING,
        display: {type: DataTypes.INTEGER, defaultValue: 2}, // 0: (lastName, firstName), 1:pseudo, 2: all of them
        public: {type: DataTypes.BOOLEAN, defaultValue: 1}, // 1 >> true
        email: DataTypes.STRING,
        phone: DataTypes.STRING,
        lang: {type: DataTypes.STRING, defaultValue: "fr"},
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
        newsletter: {type: DataTypes.BOOLEAN, defaultValue: 1}, // 1 >> true
        pwd: DataTypes.STRING,
      },
      {
        tableName: "tuser",
        timestamps: true,
      }
    ),
  };
  models.UserConn = {
    validate: null,
    master: null,
    model: sequelize.define(
      "UserConn",
      {
        idUserConn: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        idUser: DataTypes.INTEGER,
        out: DataTypes.DATE,
        maxOut: DataTypes.DATE,
      },
      {
        tableName: "tuser_conn",
        timestamps: true,
        createdAt: "in",
        updatedAt: false,
      }
    ),
  };
  models.UserExpoRole = {
    validate: null,
    master: null,
    model: sequelize.define(
      "UserExpoRole",
      {
        idUserExpo: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        idUser: DataTypes.INTEGER,
        idExpo: DataTypes.INTEGER,
        idRole: DataTypes.INTEGER, //expo related roles
      },
      {
        tableName: "tuser_expo_role",
        timestamps: true,
        createdAt: true,
        updatedAt: false,
      }
    ),
  };

  // User relationships
  models.User.model.belongsTo(models.Status.model, {foreignKey: "idStatus"});
  models.User.model.belongsTo(models.Role.model, {foreignKey: "idRole"});
  models.User.model.belongsTo(models.Image.model, {foreignKey: "idImage"});
  models.User.model.hasMany(models.UserConn.model, {foreignKey: "idUser"});
  models.User.model.hasMany(models.UserExpoRole.model, {foreignKey: "idUser"});
  models.User.model.hasMany(models.Booking.model, {foreignKey: "idUser"});
  models.User.model.hasMany(models.Partner.model, {foreignKey: "idUser"});
  models.User.model.hasMany(models.ExpoPrizeUser.model, {foreignKey: "idUser"});
  // User/UserConn relationship
  models.UserConn.model.belongsTo(models.User.model, {
    foreignKey: "idUser",
  });
  // (User,Expo,Role)/UserExpoRole relationships
  models.UserExpoRole.model.belongsTo(models.User.model, {
    foreignKey: "idUser",
  });
  models.UserExpoRole.model.belongsTo(models.Expo.model, {
    foreignKey: "idExpo",
  });
  models.UserExpoRole.model.belongsTo(models.Role.model, {
    foreignKey: "idRole",
  });
  // Booking relationships
  models.Booking.model.belongsTo(models.User.model, {foreignKey: "idUser"});
  models.Booking.model.belongsTo(models.Expo.model, {foreignKey: "idExpo"});
  models.Booking.model.belongsTo(models.Status.model, {foreignKey: "idStatus"});
  models.Booking.model.hasMany(models.BookingOeuvre.model, {
    foreignKey: "idBooking",
  });
  // BookingOeuvre relationships
  models.BookingOeuvre.model.belongsTo(models.Booking.model, {
    foreignKey: "idBooking",
  });
  models.BookingOeuvre.model.belongsTo(models.Oeuvre.model, {
    foreignKey: "idOeuvre",
  });
  models.BookingOeuvre.model.belongsTo(models.Status.model, {
    foreignKey: "idStatus",
  });
  // Oeuvre relationships
  models.Oeuvre.model.belongsTo(models.DomainTechMedia.model, {
    foreignKey: "idDomainTechMedia",
  });
  models.Oeuvre.model.belongsTo(models.Image.model, {foreignKey: "idImage"});
  // DomainTechMedia relationships
  models.DomainTechMedia.model.belongsTo(models.DomainTech.model, {
    foreignKey: "idDomainTech",
  });
  models.DomainTechMedia.model.belongsTo(models.Media.model, {
    foreignKey: "idMedia",
  });
  // DomainTech  relationships
  models.DomainTech.model.belongsTo(models.Domain.model, {
    foreignKey: "idDomain",
  });
  models.DomainTech.model.belongsTo(models.Technique.model, {
    foreignKey: "idTech",
  });
  // Expo relationships
  models.Expo.model.hasMany(models.ExpoImage.model, {foreignKey: "idExpo"});
  models.Expo.model.hasMany(models.ExpoDoc.model, {foreignKey: "idExpo"});
  models.Expo.model.hasMany(models.ExpoPartner.model, {foreignKey: "idExpo"});
  models.Expo.model.hasMany(models.ExpoPrizeUser.model, {foreignKey: "idExpo"});
  // ExpoImage relationships
  models.ExpoImage.model.belongsTo(models.Expo.model, {foreignKey: "idExpo"});
  models.ExpoImage.model.belongsTo(models.Image.model, {foreignKey: "idImage"});
  // ExpoDoc relationships
  models.ExpoDoc.model.belongsTo(models.Expo.model, {foreignKey: "idExpo"});
  models.ExpoDoc.model.belongsTo(models.Doc.model, {foreignKey: "idDoc"});
  // ExpoPartner relationships
  models.ExpoPartner.model.belongsTo(models.Expo.model, {foreignKey: "idExpo"});
  models.ExpoPartner.model.belongsTo(models.Partner.model, {
    foreignKey: "idPartner",
  });
  // ExpoPrizeUser  relationships
  models.ExpoPrizeUser.model.belongsTo(models.Expo.model, {
    foreignKey: "idExpo",
  });
  models.ExpoPrizeUser.model.belongsTo(models.User.model, {
    foreignKey: "idUser",
  });
  models.ExpoPrizeUser.model.belongsTo(models.PrizeDomain.model, {
    foreignKey: "idPrizeDomain",
  });
  // PrizeDomain relationships
  models.PrizeDomain.model.belongsTo(models.Prize.model, {
    foreignKey: "idPrize",
  });
  models.PrizeDomain.model.belongsTo(models.Domain.model, {
    foreignKey: "idDomain",
  });
  // Partner relationships
  models.Partner.model.belongsTo(models.User.model, {foreignKey: "idUser"});
  models.Partner.model.belongsTo(models.Image.model, {foreignKey: "idImage"});

  modelCache.set(sequelize, models);
};
