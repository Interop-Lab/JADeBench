'use strict';

const path = require('path');
const Jsonapi = require('./utils/jsonapiUtil');
const jwt = require('jsonwebtoken');
const helpers = require('./utils/helpers');
const { getStorageConnection } = require('./storageConnection');

const serializeUser = (value) =>
  Jsonapi.Serializer.serialize(Jsonapi.UserType, value);

exports.serveIndexPage = (request, response) => {
  response.sendFile(
    path.join(__dirname, '..', '..', '..', 'web', 'index.html')
  );
};

exports.createUser = async (request, response) => {
  try {
    const { name, email, password, role } = helpers.extractAttributes(
      request.body
    );
    const storage = getStorageConnection();
    const userCount = await storage.getUserCount();

    if (userCount && userCount.count !== 0) {
      response.status(409).send({
        errors: [
          {
            error: 'Conflict',
            message: 'Main account already created'
          }
        ]
      });
      return;
    }

    const result = await storage.createUser({
      name,
      email,
      password,
      role
    });

    if (result && result.item) {
      if (!helpers.getJWTSecret()) {
        const added = await helpers.addJWTSecret();

        if (!added) {
          response.status(500).send({
            errors: [
              {
                error: 'Internal Server Error',
                message: 'An internal server error occurred'
              }
            ]
          });
          return;
        }
      }

      const secret = helpers.getJWTSecret();
      const token = jwt.sign({ email }, secret, { expiresIn: '1w' });

      response.status(201).send(
        serializeUser({
          name,
          email,
          token
        })
      );
    } else {
      response.status(500).send({
        errors: [
          {
            error: 'Internal Server Error',
            message:
              result && result.error
                ? result.error
                : 'An internal server error occurred'
          }
        ]
      });
    }
  } catch (error) {
    console.error(error);
    response.status(500).send({
      errors: [
        {
          error: 'Internal Server Error',
          message:
            error && error.message
              ? error.message
              : 'An unexpected error occurred'
        }
      ]
    });
  }
};

exports.loginUser = async (request, response) => {
  try {
    const { email, password } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();

    if (!helpers.getJWTSecret()) {
      const added = await helpers.addJWTSecret();

      if (!added) {
        response.status(500).send({
          errors: [
            {
              error: 'Internal Server Error',
              message: 'An internal server error occurred'
            }
          ]
        });
        return;
      }
    }

    if (email && password) {
      const result = await storage.verifyUser(email, password);

      if (result && result.item && result.item.email === email) {
        const secret = helpers.getJWTSecret();
        const token = jwt.sign({ email }, secret, { expiresIn: '1w' });

        response.status(200).send(serializeUser({ token }));
      } else {
        response.status(401).send({
          errors: [
            {
              error: 'Unauthorized',
              message:
                result && result.error
                  ? result.error
                  : 'Login failed, please check your credentials'
            }
          ]
        });
      }
    } else {
      response.status(400).send({
        error: 'Bad Request',
        message: 'Email or password is missing'
      });
    }
  } catch (error) {
    response.status(500).send({
      errors: [
        {
          error: 'Internal Server Error',
          message: error
            ? error.message
            : 'An unexpected error occurred'
        }
      ]
    });
  }
};

exports.getUserProfile = async (request, response) => {
  try {
    const email = request.email;
    const storage = getStorageConnection();

    if (email) {
      const result = await storage.getUserByEmail(email);

      if (result && result.item && result.item.email) {
        response.status(200).send(serializeUser(result.item));
      } else {
        response.status(500).send({
          errors: [
            {
              error: 'Internal Server Error',
              message:
                result && result.error
                  ? result.error
                  : 'An internal server error occurred'
            }
          ]
        });
      }
    } else {
      response.status(400).send({
        errors: [
          {
            error: 'Bad Request',
            message: 'invalid request'
          }
        ]
      });
    }
  } catch (error) {
    response.status(500).send({
      errors: [
        {
          error: 'Internal Server Error',
          message: error
            ? error.message
            : 'An unexpected error occurred'
        }
      ]
    });
  }
};

exports.updateUserProfile = async (request, response) => {
  try {
    const email = request.email;
    const { name } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();

    if (email) {
      const result = await storage.updateUserByEmail(email, { name });

      if (result && result.item && result.item.email === email) {
        response.status(200).send(
          serializeUser({
            name,
            email
          })
        );
      } else {
        response.status(500).send({
          errors: [
            {
              error: 'Internal Server Error',
              message:
                result && result.error
                  ? result.message
                  : 'An internal server error occurred'
            }
          ]
        });
      }
    } else {
      response.status(400).send({
        errors: [
          {
            error: 'Bad Request',
            message: 'invalid request'
          }
        ]
      });
    }
  } catch (error) {
    response.status(500).send({
      errors: [
        {
          error: 'Internal Server Error',
          message: error
            ? error.message
            : 'An unexpected error occurred'
        }
      ]
    });
  }
};

exports.updateUserPassword = async (request, response) => {
  try {
    const email = request.email;
    const { currentPassword, newPassword } = helpers.extractAttributes(
      request.body
    );
    const storage = getStorageConnection();

    if (email) {
      const result = await storage.updatePassword(
        email,
        currentPassword,
        newPassword
      );

      if (result && result.item && result.item.email === email) {
        response.status(200).send(serializeUser({ email }));
      } else {
        response.status(500).send({
          errors: [
            {
              error: 'Internal Server Error',
              message:
                result && result.message
                  ? result.message
                  : 'An internal server error occurred'
            }
          ]
        });
      }
    } else {
      response.status(400).send({
        errors: [
          {
            error: 'Bad Request',
            message: 'invalid request'
          }
        ]
      });
    }
  } catch (error) {
    response.status(500).send({
      errors: [
        {
          error: 'Internal Server Error',
          message: error
            ? error.message
            : 'An unexpected error occurred'
        }
      ]
    });
  }
};

exports.getAllUsers = async (request, response) => {
  try {
    const email = request.email;
    const storage = getStorageConnection();

    if (email) {
      const result = await storage.getAllUsers();

      if (result && result.items) {
        response.status(200).send(serializeUser(result.items));
      } else {
        throw new Error('An unexpected error occurred');
      }
    } else {
      response.status(400).send({
        errors: [
          {
            error: 'Bad Request',
            message: 'invalid request'
          }
        ]
      });
    }
  } catch (error) {
    response.status(500).send({
      errors: [
        {
          error: 'Internal Server Error',
          message: error
            ? error.message
            : 'An unexpected error occurred'
        }
      ]
    });
  }
};

exports.getAdminName = async (request, response) => {
  try {
    const storage = getStorageConnection();
    const result = await storage.getAllUsers();

    if (result && result.items) {
      const admin = result.items.find((user) => user.role === 'admin');

      if (admin) {
        return response.status(200).send(
          serializeUser({
            name: admin.name
          })
        );
      }

      return response.status(200).send();
    }

    response.status(400).send({
      errors: [
        {
          error: 'Bad Request',
          message: 'invalid request'
        }
      ]
    });
  } catch (error) {
    response.status(500).send({
      errors: [
        {
          error: 'Internal Server Error',
          message: error
            ? error.message
            : 'An unexpected error occurred'
        }
      ]
    });
  }
};

exports.addUser = async (request, response) => {
  try {
    const requesterEmail = request.email;
    const {
      email,
      password,
      role
    } = helpers.extractAttributes(request.body);
    const storage = getStorageConnection();

    if (requesterEmail && email && password && role) {
      const requester = await storage.getUserByEmail(requesterEmail);

      if (
        requester &&
        requester.item &&
        requester.item.role === 'admin'
      ) {
        const result = await storage.createUser({
          name: 'User',
          email,
          password,
          role
        });

        if (result && result.item && result.item.email === email) {
          response.status(200).send(serializeUser(result));
        } else {
          response.status(500).send({
            errors: [
              {
                error: 'Internal Server Error',
                message:
                  result.error || 'An internal server error occurred'
              }
            ]
          });
        }
      } else {
        response.status(403).send({
          errors: [
            {
              error: 'Forbidden',
              message:
                requester && requester.error
                  ? requester.error
                  : 'Not allowed'
            }
          ]
        });
      }
    } else {
      response.status(400).send({
        errors: [
          {
            error: 'Bad Request',
            message: 'invalid request'
          }
        ]
      });
    }
  } catch (error) {
    response.status(500).send({
      errors: [
        {
          error: 'Internal Server Error',
          message: error
            ? error.message
            : 'An unexpected error occurred'
        }
      ]
    });
  }
};

exports.removeUser = async (request, response) => {
  try {
    const requesterEmail = request.email;
    const userId = request.params.userId;
    const storage = getStorageConnection();

    if (requesterEmail && userId) {
      const requester = await storage.getUserByEmail(requesterEmail);

      if (
        requester &&
        requester.item &&
        requester.item.role === 'admin'
      ) {
        const result = await storage.deleteUser(userId);

        if (result) {
          response.status(200).send(serializeUser(result));
        } else {
          response.status(500).send({
            errors: [
              {
                error: 'Internal Server Error',
                message:
                  result.error || 'An internal server error occurred'
              }
            ]
          });
        }
      } else {
        response.status(403).send({
          errors: [
            {
              error: 'Forbidden',
              message:
                requester && requester.error
                  ? requester.error
                  : 'Not allowed'
            }
          ]
        });
      }
    } else {
      response.status(400).send({
        errors: [
          {
            error: 'Bad Request',
            message: 'invalid request'
          }
        ]
      });
    }
  } catch (error) {
    response.status(500).send({
      errors: [
        {
          error: 'Internal Server Error',
          message: error
            ? error.message
            : 'An unexpected error occurred'
        }
      ]
    });
  }
};

exports.getTotalUsers = async (request, response) => {
  try {
    const storage = getStorageConnection();
    const result = await storage.getUserCount();

    response.send(
      serializeUser({
        count: result.count
      })
    );
  } catch (error) {
    console.error(error);
    response.status(500).send({
      error: 'An error occurred while fetching user count.'
    });
  }
};
