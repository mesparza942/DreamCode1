module.exports = (sequelize, type) => {
    return sequelize.define('note', {
      id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: type.STRING,
      hobbies: type.STRING,
    })
  }