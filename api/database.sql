CREATE DATABASE API_DB COLLATE utf8_general_ci;

USE API_DB;

CREATE TABLE qrCodes
(
    id INT NOT NULL
    AUTO_INCREMENT,
    data    VARCHAR
    (255)    NOT NULL,
    type    VARCHAR
    (255)    NOT NULL,
    PRIMARY KEY
    (id)
);

