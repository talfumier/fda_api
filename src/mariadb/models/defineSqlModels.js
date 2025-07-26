const modelCache = new WeakMap();
export const defineSqlModels = (sequelize, DataTypes) => {
  if (modelCache.has(sequelize)) return modelCache.get(sequelize);

  const models = {};

  models.User = sequelize.define(
    "User",
    {
      idUser: {type: DataTypes.INTEGER, primaryKey: true},
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
      created: DataTypes.DATE,
      updated: DataTypes.DATE,
    },
    {tableName: "tuser", timestamps: false}
  );

  models.Status = sequelize.define(
    "Status",
    {
      idStatus: {type: DataTypes.INTEGER, primaryKey: true},
      type: DataTypes.STRING,
      title_fr: DataTypes.STRING,
      title_en: DataTypes.STRING,
      created: DataTypes.DATE,
      updated: DataTypes.DATE,
    },
    {tableName: "tstatus", timestamps: false}
  );

  models.Role = sequelize.define(
    "Role",
    {
      idRole: {type: DataTypes.INTEGER, primaryKey: true},
      role_fr: DataTypes.STRING,
      created: DataTypes.DATE,
      updated: DataTypes.DATE,
    },
    {tableName: "trole", timestamps: false}
  );

  models.UserRole = sequelize.define(
    "UserRole",
    {
      idUserRole: {type: DataTypes.INTEGER, primaryKey: true},
      idUser: DataTypes.INTEGER,
      idRole: DataTypes.INTEGER,
      created: DataTypes.DATE,
    },
    {tableName: "tuser_role", timestamps: false}
  );

  models.Expo = sequelize.define(
    "Expo",
    {
      idExpo: {type: DataTypes.INTEGER, primaryKey: true},
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
      created: DataTypes.DATE,
      updated: DataTypes.DATE,
    },
    {tableName: "texpo", timestamps: false}
  );

  models.UserExpo = sequelize.define(
    "UserExpo",
    {
      idUserExpo: {type: DataTypes.INTEGER, primaryKey: true},
      idUser: DataTypes.INTEGER,
      idExpo: DataTypes.INTEGER,
      created: DataTypes.DATE,
    },
    {tableName: "tuser_expo", timestamps: false}
  );

  models.Booking = sequelize.define(
    "Booking",
    {
      idBooking: {type: DataTypes.INTEGER, primaryKey: true},
      idExpo: DataTypes.INTEGER,
      status: DataTypes.STRING,
      vernissage: DataTypes.BOOLEAN,
      lunch: DataTypes.BOOLEAN,
      created: DataTypes.DATE,
      updated: DataTypes.DATE,
    },
    {tableName: "tbooking", timestamps: false}
  );

  models.BookingOeuvre = sequelize.define(
    "BookingOeuvre",
    {
      idBookingOeuvre: {type: DataTypes.INTEGER, primaryKey: true},
      idBooking: DataTypes.INTEGER,
      idOeuvre: DataTypes.INTEGER,
      showRoom: DataTypes.BOOLEAN,
      screen: DataTypes.BOOLEAN,
      created: DataTypes.DATE,
    },
    {tableName: "tbooking_oeuvre", timestamps: false}
  );

  models.Oeuvre = sequelize.define(
    "Oeuvre",
    {
      idOeuvre: {type: DataTypes.INTEGER, primaryKey: true},
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
    {tableName: "toeuvre", timestamps: false}
  );

  models.DomainTechMedia = sequelize.define(
    "DomainTechMedia",
    {
      idDomainTechMedia: {type: DataTypes.INTEGER, primaryKey: true},
      idDomainTech: DataTypes.INTEGER,
      idMedia: DataTypes.INTEGER,
      created: DataTypes.DATE,
    },
    {tableName: "tdomain_technique_media", timestamps: false}
  );

  models.DomainTech = sequelize.define(
    "DomainTech",
    {
      idDomainTech: {type: DataTypes.INTEGER, primaryKey: true},
      idDomain: DataTypes.INTEGER,
      idTech: DataTypes.INTEGER,
      created: DataTypes.DATE,
    },
    {tableName: "tdomain_technique", timestamps: false}
  );

  models.Domain = sequelize.define(
    "Domain",
    {
      idDomain: {type: DataTypes.INTEGER, primaryKey: true},
      domain_fr: DataTypes.STRING,
      domain_en: DataTypes.STRING,
      created: DataTypes.DATE,
      updated: DataTypes.DATE,
    },
    {tableName: "tdomain", timestamps: false}
  );

  models.Technique = sequelize.define(
    "Technique",
    {
      idTech: {type: DataTypes.INTEGER, primaryKey: true},
      technique_fr: DataTypes.STRING,
      technique_en: DataTypes.STRING,
      created: DataTypes.DATE,
      updated: DataTypes.DATE,
    },
    {tableName: "ttechnique", timestamps: false}
  );

  models.Media = sequelize.define(
    "Media",
    {
      idMedia: {type: DataTypes.INTEGER, primaryKey: true},
      media_fr: DataTypes.STRING,
      media_en: DataTypes.STRING,
      created: DataTypes.DATE,
      updated: DataTypes.DATE,
    },
    {tableName: "tmedia", timestamps: false}
  );

  models.Prize = sequelize.define(
    "Prize",
    {
      idPrize: {type: DataTypes.INTEGER, primaryKey: true},
      prize_fr: DataTypes.STRING,
      prize_en: DataTypes.STRING,
      created: DataTypes.DATE,
      updated: DataTypes.DATE,
    },
    {tableName: "tprize", timestamps: false}
  );

  models.PrizeDomain = sequelize.define(
    "PrizeDomain",
    {
      idPrize: DataTypes.INTEGER,
      idDomain: DataTypes.INTEGER,
    },
    {tableName: "tprize_domain", timestamps: false}
  );

  models.ExpoPrizeUser = sequelize.define(
    "ExpoPrizeUser",
    {
      idExpoPrizeUser: {type: DataTypes.INTEGER, primaryKey: true},
      idExpo: DataTypes.INTEGER,
      idPrizeDomain: DataTypes.INTEGER,
      idUser: DataTypes.INTEGER,
      created: DataTypes.DATE,
    },
    {tableName: "texpo_prize_user", timestamps: false}
  );

  models.Image = sequelize.define(
    "Image",
    {
      idImage: {type: DataTypes.INTEGER, primaryKey: true},
      title_fr: DataTypes.STRING,
      title_en: DataTypes.STRING,
      url: DataTypes.STRING,
      data: DataTypes.BLOB,
      created: DataTypes.DATE,
      updated: DataTypes.DATE,
    },
    {tableName: "timage", timestamps: false}
  );

  models.Partner = sequelize.define(
    "Partner",
    {
      idPartner: {type: DataTypes.INTEGER, primaryKey: true},
      name: DataTypes.STRING,
      address: DataTypes.STRING,
      zipCode: DataTypes.STRING,
      city: DataTypes.STRING,
      country: DataTypes.STRING,
      idImage: DataTypes.INTEGER,
      idUser: DataTypes.INTEGER,
      created: DataTypes.DATE,
      updated: DataTypes.DATE,
    },
    {tableName: "tpartner", timestamps: false}
  );

  models.ExpoPartner = sequelize.define(
    "ExpoPartner",
    {
      idExpoPartner: {type: DataTypes.INTEGER, primaryKey: true},
      idExpo: DataTypes.INTEGER,
      idPartner: DataTypes.INTEGER,
      created: DataTypes.DATE,
    },
    {tableName: "texpo_partner", timestamps: false}
  );

  models.ExpoImage = sequelize.define(
    "ExpoImage",
    {
      idExpoImage: {type: DataTypes.INTEGER, primaryKey: true},
      idExpo: DataTypes.INTEGER,
      idImage: DataTypes.INTEGER,
      created: DataTypes.DATE,
    },
    {tableName: "texpo_image", timestamps: false}
  );

  models.ExpoDoc = sequelize.define(
    "ExpoDoc",
    {
      idExpoDoc: {type: DataTypes.INTEGER, primaryKey: true},
      idExpo: DataTypes.INTEGER,
      idDoc: DataTypes.INTEGER,
      created: DataTypes.DATE,
    },
    {tableName: "texpo_doc", timestamps: false}
  );

  models.Doc = sequelize.define(
    "Doc",
    {
      idDoc: {type: DataTypes.INTEGER, primaryKey: true},
      standalone: DataTypes.BOOLEAN,
      name_fr: DataTypes.STRING,
      name_en: DataTypes.STRING,
      desc_fr: DataTypes.TEXT,
      desc_en: DataTypes.TEXT,
      url: DataTypes.STRING,
      created: DataTypes.DATE,
      updated: DataTypes.DATE,
    },
    {tableName: "tdoc", timestamps: false}
  );

  // Define relationships
  models.User.belongsTo(models.Status, {foreignKey: "idStatus"});
  models.User.belongsTo(models.Image, {foreignKey: "idImage"});
  models.User.hasMany(models.UserRole, {foreignKey: "idUser"});
  models.User.hasMany(models.UserExpo, {foreignKey: "idUser"});

  models.UserRole.belongsTo(models.Role, {foreignKey: "idRole"});

  models.Booking.belongsTo(models.Expo, {foreignKey: "idExpo"});
  models.Booking.hasMany(models.BookingOeuvre, {foreignKey: "idBooking"});

  models.BookingOeuvre.belongsTo(models.Oeuvre, {foreignKey: "idOeuvre"});

  models.Oeuvre.belongsTo(models.DomainTechMedia, {
    foreignKey: "idDomainTechMedia",
  });
  models.Oeuvre.belongsTo(models.Image, {foreignKey: "idImage"});

  models.DomainTechMedia.belongsTo(models.DomainTech, {
    foreignKey: "idDomainTech",
  });
  models.DomainTechMedia.belongsTo(models.Media, {foreignKey: "idMedia"});

  models.DomainTech.belongsTo(models.Domain, {foreignKey: "idDomain"});
  models.DomainTech.belongsTo(models.Technique, {foreignKey: "idTech"});

  models.Expo.hasMany(models.ExpoImage, {foreignKey: "idExpo"});
  models.Expo.hasMany(models.ExpoDoc, {foreignKey: "idExpo"});
  models.Expo.hasMany(models.ExpoPrizeUser, {foreignKey: "idExpo"});

  models.ExpoPrizeUser.belongsTo(models.User, {foreignKey: "idUser"});

  modelCache.set(sequelize, models);
  return models;
};
