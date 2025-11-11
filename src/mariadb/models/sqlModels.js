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

  models.Admin = {
    validate: null,
    master: ["idAdmin"],
    model: sequelize.define(
      "Admin",
      {
        idAdmin: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        orgExcluded: DataTypes.INTEGER, //1 >>> only artist, guest and jury roles are visible at account creation, 0 >>> all roles visible
      },
      {tableName: "tadmin", timestamps: true}
    ),
  };
  models.Booking = {
    validate: val.validateBooking,
    master: ["idExpo", "idUser"],
    model: sequelize.define(
      "Booking",
      {
        idBooking: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        idExpo: DataTypes.INTEGER,
        idUser: DataTypes.INTEGER,
        vernissage: DataTypes.BOOLEAN,
        lunch: DataTypes.BOOLEAN,
        price: {type: DataTypes.INTEGER, defaultValue: 0},
        terms: {type: DataTypes.INTEGER, defaultValue: 0}, //terms & conditions 0 >>> not accepted, 1 >>> accepted
      },
      {tableName: "tbooking", timestamps: true}
    ),
  };
  models.BookingOeuvre = {
    validate: null,
    master: ["idBooking", "idOeuvre"],
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
        selected: DataTypes.BOOLEAN,
        showRoom: DataTypes.BOOLEAN,
        screen: DataTypes.BOOLEAN,
      },
      {tableName: "tbooking_oeuvre", timestamps: true}
    ),
  };
  models.Doc = {
    validate: val.validateDoc,
    master: ["short"],
    model: sequelize.define(
      "Doc",
      {
        idDoc: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        // standalone: DataTypes.BOOLEAN,
        short: DataTypes.STRING,
        desc_fr: DataTypes.STRING, //up to 255 car long
        desc_en: DataTypes.STRING,
        idFile: {type: DataTypes.STRING, defaultValue: null},
      },
      {tableName: "tdoc", timestamps: true}
    ),
  };
  models.Type = {
    validate: null,
    master: ["type_fr", "type_en"],
    model: sequelize.define(
      "Type",
      {
        idType: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: false,
        },
        type_fr: DataTypes.STRING,
        type_en: DataTypes.STRING,
      },
      {tableName: "ttype", timestamps: true}
    ),
  };
  models.File = {
    validate: val.validateFile,
    master: ["url"],
    model: sequelize.define(
      "File",
      {
        idFile: {
          type: DataTypes.STRING,
          primaryKey: true,
          autoIncrement: false,
        },
        fileName: DataTypes.STRING,
        fileSize: DataTypes.INTEGER,
        fileLastModified: DataTypes.DATE,
        url: DataTypes.STRING,
      },
      {
        tableName: "tfile",
        timestamps: true,
        createdAt: true,
        updatedAt: false,
      }
    ),
  };
  models.Domain = {
    validate: val.validateDomain,
    master: ["domain_fr", "domain_en"],
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
        order: DataTypes.INTEGER,
      },
      {tableName: "tdomain", timestamps: true}
    ),
  };
  models.Expo = {
    validate: val.validateExpo,
    master: ["startDate", "endDate"],
    model: sequelize.define(
      "Expo",
      {
        idExpo: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        short_en: DataTypes.STRING,
        short_fr: DataTypes.STRING,
        title_en: DataTypes.STRING,
        title_fr: DataTypes.STRING,
        desc_fr: DataTypes.TEXT,
        desc_en: DataTypes.TEXT,
        startDate: DataTypes.DATE,
        endDate: DataTypes.DATE,
        address: DataTypes.STRING,
        zipCode: DataTypes.STRING,
        city: DataTypes.STRING,
        country: DataTypes.STRING,
        gpsLat: DataTypes.STRING,
        gpsLong: DataTypes.STRING,
        closureDateTime: DataTypes.DATE,
        depotDateTime_open: DataTypes.DATE,
        depotDateTime_close: DataTypes.DATE,
        collectionDateTime_open: DataTypes.DATE,
        collectionDateTime_close: DataTypes.DATE,
        vernissageDateTime: DataTypes.DATE,
        lunchDateTime: DataTypes.DATE,
        priceShowRoom: {type: DataTypes.INTEGER, defaultValue: 0},
        priceScreen: {type: DataTypes.INTEGER, defaultValue: 0},
      },
      {tableName: "texpo", timestamps: true}
    ),
  };
  models.ExpoDoc = {
    validate: null,
    master: ["idExpo", "idDoc", "idType"],
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
        idType: {type: DataTypes.INTEGER, defaultValue: 5}, // 5 >>> standard document
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
    master: ["idExpo", "idFile"],
    model: sequelize.define(
      "ExpoImage",
      {
        idExpoImage: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        idExpo: DataTypes.INTEGER,
        idFile: DataTypes.STRING,
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
    master: ["idExpo", "idPartner"],
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
    master: ["idExpo", "idPrize", "idUser"],
    model: sequelize.define(
      "ExpoPrizeUser",
      {
        idExpoPrizeUser: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        idExpo: {type: DataTypes.INTEGER, allowNull: true},
        idPrize: DataTypes.INTEGER,
        idUser: {type: DataTypes.INTEGER, allowNull: true},
        applicable: {type: DataTypes.INTEGER, defaultValue: 1}, //0:n/a, 1:applicable
      },
      {
        tableName: "texpo_prize_user",
        timestamps: true,
        createdAt: true,
        updatedAt: false,
      }
    ),
  };
  models.Media = {
    validate: val.validateMedia,
    master: ["media_fr", "media_en"],
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
        order: DataTypes.INTEGER,
      },
      {tableName: "tmedia", timestamps: true}
    ),
  };
  models.Oeuvre = {
    validate: val.validateOeuvre,
    master: ["no-check"],
    model: sequelize.define(
      "Oeuvre",
      {
        idOeuvre: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        idUser: DataTypes.INTEGER,
        classic_modern: {type: DataTypes.INTEGER, defaultValue: 0}, //0:classic, 1:modern
        idDomain: DataTypes.INTEGER,
        idTech: DataTypes.INTEGER,
        idMedia: DataTypes.INTEGER,
        title_fr: DataTypes.STRING,
        title_en: DataTypes.STRING,
        desc_fr: DataTypes.TEXT,
        desc_en: DataTypes.TEXT,
        completionDate: DataTypes.DATE,
        price: DataTypes.FLOAT,
        reserved: DataTypes.BOOLEAN,
        width: DataTypes.INTEGER,
        height: DataTypes.INTEGER,
        depth: DataTypes.INTEGER,
        weight: DataTypes.INTEGER,
        idFile: DataTypes.STRING,
      },
      {tableName: "toeuvre", timestamps: true}
    ),
  };
  models.Partner = {
    validate: val.validatePartner,
    master: ["name"],
    model: sequelize.define(
      "Partner",
      {
        idPartner: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        short: DataTypes.STRING,
        name: DataTypes.STRING,
        address: DataTypes.STRING,
        zipCode: DataTypes.STRING,
        city: DataTypes.STRING,
        country: DataTypes.STRING,
        resume_fr: DataTypes.TEXT,
        resume_en: DataTypes.TEXT,
        idFile: DataTypes.STRING,
        web1: DataTypes.STRING,
        web2: DataTypes.STRING,
        social1: DataTypes.STRING,
        social2: DataTypes.STRING,
        lastNameRep: DataTypes.STRING,
        firstNameRep: DataTypes.STRING,
        emailRep: DataTypes.STRING,
        phoneRep: DataTypes.STRING,
      },
      {tableName: "tpartner", timestamps: true}
    ),
  };
  models.Prize = {
    validate: val.validatePrize,
    master: ["prize_fr", "prize_en"],
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
        order: DataTypes.INTEGER,
      },
      {tableName: "tprize", timestamps: true}
    ),
  };
  models.Role = {
    validate: null,
    master: ["role_fr", "role_en"],
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
    validate: null,
    master: ["type", "title_fr", "title_en"],
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
  models.Tech = {
    validate: val.validateTechnique,
    master: ["tech_fr", "tech_en"],
    model: sequelize.define(
      "Tech",
      {
        idTech: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        tech_fr: DataTypes.STRING,
        tech_en: DataTypes.STRING,
        order: DataTypes.INTEGER,
      },
      {tableName: "ttechnique", timestamps: true}
    ),
  };
  models.StatusTracking = {
    validate: null,
    master: null, //managed in entities.js
    model: sequelize.define(
      "StatusTracking",
      {
        idStatusTracking: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        idStatus: DataTypes.INTEGER,
        idUser: {type: DataTypes.INTEGER, allowNull: true},
        idExpo: {type: DataTypes.INTEGER, allowNull: true},
        idBookingOeuvre: {type: DataTypes.INTEGER, allowNull: true},
        idBooking: {type: DataTypes.INTEGER, allowNull: true},
      },
      {
        tableName: "tstatus_tracking",
        timestamps: true,
        createdAt: true,
        updatedAt: false,
      }
    ),
  };
  models.User = {
    validate: val.validateUser,
    master: ["email"],
    model: sequelize.define(
      "User",
      {
        idUser: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        idRole: {type: DataTypes.INTEGER, defaultValue: 1}, //account related roles, 1 >> artist
        lastName: DataTypes.STRING,
        firstName: DataTypes.STRING,
        public_name: {type: DataTypes.BOOLEAN, defaultValue: 1},
        pseudo: DataTypes.STRING,
        public_pseudo: {type: DataTypes.BOOLEAN, defaultValue: 0},
        email: DataTypes.STRING,
        public_email: {type: DataTypes.BOOLEAN, defaultValue: 0},
        phone: DataTypes.STRING,
        public_phone: {type: DataTypes.BOOLEAN, defaultValue: 0},
        lang: {type: DataTypes.STRING, defaultValue: "fr"},
        address: DataTypes.STRING,
        zipCode: DataTypes.STRING,
        city: DataTypes.STRING,
        country: DataTypes.STRING,
        resume_fr: DataTypes.TEXT,
        resume_en: DataTypes.TEXT,
        idFile: DataTypes.STRING,
        public_image: {type: DataTypes.BOOLEAN, defaultValue: 1},
        web1: DataTypes.STRING,
        web2: DataTypes.STRING,
        social1: DataTypes.STRING,
        social2: DataTypes.STRING,
        newsletter: {type: DataTypes.BOOLEAN, defaultValue: 0}, // 0 >> false
        cgu_cgv: {type: DataTypes.DATE, defaultValue: DataTypes.NOW},
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
    master: [],
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
    master: ["idUser", "idExpo", "idRole"],
    model: sequelize.define(
      "UserExpoRole",
      {
        idUserExpoRole: {
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
  // StatusTracking relationships
  models.StatusTracking.model.belongsTo(models.Status.model, {
    foreignKey: "idStatus",
    onDelete: "CASCADE",
  });
  models.BookingOeuvre.model.hasMany(models.StatusTracking.model, {
    foreignKey: "idBookingOeuvre",
    onDelete: "CASCADE",
  });
  models.Booking.model.hasMany(models.StatusTracking.model, {
    foreignKey: "idBooking",
    onDelete: "CASCADE",
  });
  // User relationships
  models.User.model.hasMany(models.StatusTracking.model, {
    foreignKey: "idUser",
    onDelete: "CASCADE",
  });
  models.User.model.belongsTo(models.Role.model, {
    foreignKey: "idRole",
    onDelete: "RESTRICT",
  });
  models.User.model.belongsTo(models.File.model, {
    foreignKey: "idFile",
    onDelete: "RESTRICT",
  });
  models.User.model.hasMany(models.UserConn.model, {
    foreignKey: "idUser",
    onDelete: "CASCADE",
  });
  models.User.model.hasMany(models.UserExpoRole.model, {
    foreignKey: "idUser",
    onDelete: "RESTRICT",
  });
  models.User.model.hasMany(models.Booking.model, {
    foreignKey: "idUser",
    onDelete: "RESTRICT",
  });
  models.User.model.hasMany(models.Oeuvre.model, {
    foreignKey: "idUser",
    onDelete: "RESTRICT",
  });
  models.User.model.hasMany(models.ExpoPrizeUser.model, {
    foreignKey: "idUser",
    onDelete: "RESTRICT",
  });
  // User/UserConn relationship
  models.UserConn.model.belongsTo(models.User.model, {
    foreignKey: "idUser",
    onDelete: "CASCADE",
  });
  // (User,Expo,Role)/UserExpoRole relationships
  models.UserExpoRole.model.belongsTo(models.User.model, {
    foreignKey: "idUser",
    onDelete: "RESTRICT",
  });
  models.UserExpoRole.model.belongsTo(models.Expo.model, {
    foreignKey: "idExpo",
    onDelete: "RESTRICT",
  });
  models.UserExpoRole.model.belongsTo(models.Role.model, {
    foreignKey: "idRole",
    onDelete: "RESTRICT",
  });
  // Booking relationships
  models.Booking.model.belongsTo(models.User.model, {
    foreignKey: "idUser",
    onDelete: "RESTRICT",
  });
  models.Booking.model.belongsTo(models.Expo.model, {
    foreignKey: "idExpo",
    onDelete: "RESTRICT",
  });
  models.Booking.model.hasMany(models.BookingOeuvre.model, {
    foreignKey: "idBooking",
    onDelete: "CASCADE",
  });
  // BookingOeuvre relationships
  models.BookingOeuvre.model.belongsTo(models.Booking.model, {
    foreignKey: "idBooking",
    onDelete: "RESTRICT",
  });
  models.BookingOeuvre.model.belongsTo(models.Oeuvre.model, {
    foreignKey: "idOeuvre",
    onDelete: "RESTRICT",
  });
  // Oeuvre relationships
  models.Oeuvre.model.hasMany(models.BookingOeuvre.model, {
    foreignKey: "idOeuvre",
    onDelete: "CASCADE",
  });
  models.Oeuvre.model.belongsTo(models.Domain.model, {
    foreignKey: "idDomain",
    onDelete: "RESTRICT",
  });
  models.Oeuvre.model.belongsTo(models.Tech.model, {
    foreignKey: "idTech",
    onDelete: "RESTRICT",
  });
  models.Oeuvre.model.belongsTo(models.Media.model, {
    foreignKey: "idMedia",
    onDelete: "RESTRICT",
  });
  models.Oeuvre.model.belongsTo(models.User.model, {
    foreignKey: "idUser",
    onDelete: "RESTRICT",
  });
  models.Oeuvre.model.belongsTo(models.File.model, {
    foreignKey: "idFile",
    onDelete: "RESTRICT",
  });
  // Expo relationships
  models.Expo.model.hasMany(models.StatusTracking.model, {
    foreignKey: "idExpo",
    onDelete: "CASCADE",
  });
  models.Expo.model.hasMany(models.ExpoImage.model, {
    foreignKey: "idExpo",
    onDelete: "CASCADE",
  });
  models.Expo.model.hasMany(models.ExpoDoc.model, {
    foreignKey: "idExpo",
    onDelete: "CASCADE",
  });
  models.Expo.model.hasMany(models.ExpoPartner.model, {
    foreignKey: "idExpo",
    onDelete: "RESTRICT",
  });
  models.Expo.model.hasMany(models.ExpoPrizeUser.model, {
    foreignKey: "idExpo",
    onDelete: "RESTRICT",
  });
  // ExpoImage relationships
  models.ExpoImage.model.belongsTo(models.Expo.model, {
    foreignKey: "idExpo",
    onDelete: "RESTRICT",
  });
  models.ExpoImage.model.belongsTo(models.File.model, {
    foreignKey: "idFile",
    onDelete: "CASCADE",
  });
  // Doc relationships
  models.Doc.model.hasMany(models.ExpoDoc.model, {
    foreignKey: "idDoc",
    onDelete: "CASCADE",
  });
  models.Doc.model.belongsTo(models.File.model, {
    foreignKey: "idFile",
    onDelete: "RESTRICT",
  });
  // ExpoDoc relationships
  models.ExpoDoc.model.belongsTo(models.Expo.model, {
    foreignKey: "idExpo",
    onDelete: "CASCADE",
  });
  models.ExpoDoc.model.belongsTo(models.Doc.model, {
    foreignKey: "idDoc",
    onDelete: "RESTRICT",
  });
  models.ExpoDoc.model.belongsTo(models.Type.model, {
    foreignKey: "idType",
    onDelete: "RESTRICT",
  });
  // ExpoPartner relationships
  models.ExpoPartner.model.belongsTo(models.Expo.model, {
    foreignKey: "idExpo",
    onDelete: "RESTRICT",
  });
  models.ExpoPartner.model.belongsTo(models.Partner.model, {
    foreignKey: "idPartner",
    onDelete: "RESTRICT",
  });
  // ExpoPrizeUser  relationships
  models.ExpoPrizeUser.model.belongsTo(models.Expo.model, {
    foreignKey: "idExpo",
    onDelete: "RESTRICT",
  });
  models.ExpoPrizeUser.model.belongsTo(models.User.model, {
    foreignKey: "idUser",
    onDelete: "RESTRICT",
  });
  models.ExpoPrizeUser.model.belongsTo(models.Prize.model, {
    foreignKey: "idPrize",
    onDelete: "RESTRICT",
  });
  //Prize relationship
  models.Prize.model.hasMany(models.ExpoPrizeUser.model, {
    foreignKey: "idPrize",
    onDelete: "RESTRICT",
  });
  // Partner relationships
  models.Partner.model.belongsTo(models.File.model, {
    foreignKey: "idFile",
    onDelete: "RESTRICT",
  });

  modelCache.set(sequelize, models);
};
