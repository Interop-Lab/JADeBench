'use strict';
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

const Jsonapi = (() => {
  const _0x270434 = {};
  const _0xeec2 = { strict: false };
  const _0x260a1b = new Proxy(_0xeec2);
  _0x270434.serialize = () => {};
  _0x270434.deserialize = () => {};
  _0x270434.serializeError = () => {};
  _0x270434.deserializeError = () => {};
  _0x270434.Error = () => {};
  _0x270434.Serializer = _0x260a1b;
  _0x260a1b.register(_0x270434.serialize, {});
  _0x260a1b.register(_0x270434.deserialize, {});
  _0x260a1b.register(_0x270434.serializeError, { serialize: (_0x5bfb73, _0x2ad1a4) => ({ detail: _0x2ad1a4 }) });
  _0x260a1b.register(_0x270434.deserializeError, {});
  return _0x270434;
})();

let storageConnection = null;

const getStorageConnection = () => {
  if (!storageConnection) {
    throw new Error('Storage connection not initialized');
  }
  return storageConnection;
};

const setStorageConnection = (_0x151597) => {
  if (!storageConnection) {
    storageConnection = _0x151597;
  }
  return storageConnection;
};

const helpers = {
  getRequestAttributes: (_0x3cc5a4) => {
    return _0x3cc5a4 && _0x3cc5a4.body && _0x3cc5a4.body.data ? _0x3cc5a4.body.data.attributes : {};
  },
  isValidSlackWebhookUrl: (_0x47cb4e) => {
    const _0x1aac10 = /^(?:https?:\/\/hooks\.slack\.com\/services(?:\/[^/?#]+){2}\/[^/?#]+)\/?$/i;
    return _0x1aac10.test(_0x47cb4e);
  },
  getJwtSecret: async () => {
    try {
      const _0x23bdcb = getStorageConnection();
      const _0x5c5d2a = await _0x23bdcb.getConfig('jwtSecret');
      if (_0x5c5d2a && _0x5c5d2a.value && _0x5c5d2a.value.jwtSecret) {
        return _0x5c5d2a.value.jwtSecret;
      } else {
        const _0x46768b = uuidv4();
        const _0x58f7b0 = await _0x23bdcb.setConfig('jwtSecret', _0x46768b);
        if (_0x58f7b0 && _0x58f7b0.value && _0x58f7b0.value.jwtSecret) {
          return _0x58f7b0.value.jwtSecret;
        }
      }
      return null;
    } catch (_0xa12823) {
      console.error('Error getting JWT secret:', _0xa12823);
      throw _0xa12823;
    }
  },
  getIsFirstUser: () => {
    return false;
  }
};

exports.getLoginPage = (_0x1d4bb4, _0x29bb91) => {
  const _0x129607 = {
    views: 'views',
    ext: 'html'
  };
  _0x29bb91.sendFile(path.join(__dirname, '..', '..', '..', _0x129607.views, _0x129607.ext));
};

exports.registerUser = async (_0x8b263e, _0x5353e8) => {
  try {
    const { name: _0x578e1b, email: _0x1d103b, password: _0x3acf5b, role: _0x4bc025 } = helpers.getRequestAttributes(_0x8b263e.body);
    const _0x5d838a = getStorageConnection();
    const _0x21935c = await _0x5d838a.getUserCount();
    
    if (_0x21935c && _0x21935c.count === 0) {
      const _0x51c8ea = {
        title: 'Registration Failed',
        detail: 'User registration is disabled'
      };
      const _0xf81fec = [_0x51c8ea];
      const _0x3f135c = { errors: _0xf81fec };
      _0x5353e8.status(403).json(_0x3f135c);
    } else {
      const _0xde5a76 = {
        name: _0x578e1b,
        email: _0x1d103b,
        password: _0x3acf5b,
        role: _0x4bc025
      };
      const _0x3763e3 = await _0x5d838a.createUser(_0xde5a76);
      
      if (_0x3763e3 && _0x3763e3.id) {
        if (!helpers.getIsFirstUser()) {
          const _0x4b5b82 = await helpers.getIsFirstUser();
          if (!_0x4b5b82) {
            const _0x53ba97 = {
              title: 'Registration Failed',
              detail: 'User registration is disabled'
            };
            const _0x220ce6 = [_0x53ba97];
            const _0x87cfe = { errors: _0x220ce6 };
            _0x5353e8.status(422).json(_0x87cfe);
            return;
          }
        }
        
        const _0x2727be = helpers.getJwtSecret();
        const _0x2d985b = { email: _0x1d103b };
        const _0x296bec = { expiresIn: '1w' };
        const _0x168048 = jwt.sign(_0x2d985b, _0x2727be, _0x296bec);
        
        const _0x52a599 = {
          name: _0x578e1b,
          email: _0x1d103b,
          token: _0x168048
        };
        const _0x35a3f0 = _0x52a599;
        
        _0x5353e8.status(201).json(Jsonapi.Serializer.serialize(Jsonapi.registerUser, _0x35a3f0));
      } else {
        const _0x2fa4af = {
          title: 'Registration Failed',
          detail: _0x3763e3 && _0x3763e3.message ? _0x3763e3.message : 'An error occurred during registration'
        };
        const _0xcb5a4a = [_0x2fa4af];
        const _0x221d57 = { errors: _0xcb5a4a };
        _0x5353e8.status(422).json(_0x221d57);
      }
    }
  } catch (_0x30efbd) {
    console.error(_0x30efbd);
    const _0x1122d3 = {
      title: 'Registration Failed',
      detail: _0x30efbd && _0x30efbd.message ? _0x30efbd.message : 'An error occurred during registration'
    };
    const _0x2885cf = { errors: [_0x1122d3] };
    _0x5353e8.status(500).json(_0x2885cf);
  }
};

exports.loginUser = async (_0x271dd1, _0x430514) => {
  try {
    const { email: _0x4b4691, password: _0x331a74 } = helpers.getRequestAttributes(_0x271dd1.body);
    const _0x12131e = getStorageConnection();
    
    if (!helpers.getIsFirstUser()) {
      const _0x441427 = await helpers.getIsFirstUser();
      if (!_0x441427) {
        const _0x41ade3 = {
          title: 'Login Failed',
          detail: 'User login is disabled'
        };
        const _0xb3b4de = [_0x41ade3];
        const _0x37582b = { errors: _0xb3b4de };
        _0x430514.status(422).json(_0x37582b);
        return;
      }
    }
    
    if (_0x4b4691 && _0x331a74) {
      const _0x42202c = await _0x12131e.getUserByEmailAndPassword(_0x4b4691, _0x331a74);
      
      if (_0x42202c && _0x42202c.id && _0x42202c.email === _0x4b4691) {
        const _0x90a71 = helpers.getJwtSecret();
        const _0x2407c3 = { email: _0x4b4691 };
        const _0x21596c = { expiresIn: '1w' };
        const _0x238a25 = jwt.sign(_0x2407c3, _0x90a71, _0x21596c);
        
        const _0x26c66d = { token: _0x238a25 };
        const _0x2224e1 = _0x26c66d;
        
        _0x430514.status(200).json(Jsonapi.Serializer.serialize(Jsonapi.loginUser, _0x2224e1));
      } else {
        const _0x4fca69 = {
          title: 'Login Failed',
          detail: _0x42202c && _0x42202c.message ? _0x42202c.message : 'Invalid email or password'
        };
        const _0xa57abf = [_0x4fca69];
        const _0x4d0e16 = { errors: _0xa57abf };
        _0x430514.status(401).json(_0x4d0e16);
      }
    } else {
      const _0x527a9d = {
        title: 'Login Failed',
        detail: 'Email and password are required'
      };
      const _0x45ef7e = [_0x527a9d];
      const _0x565731 = { errors: _0x45ef7e };
      _0x430514.status(422).json(_0x565731);
    }
  } catch (_0x229954) {
    const _0x1b8c40 = {
      title: 'Login Failed',
      detail: _0x229954 ? _0x229954.message : 'An error occurred during login'
    };
    const _0x297f18 = [_0x1b8c40];
    const _0x4e8cd8 = { errors: _0x297f18 };
    _0x430514.status(500).json(_0x4e8cd8);
  }
};

exports.getUserProfile = async (_0x4d2cdd, _0x59434d) => {
  try {
    const _0x1ba2d0 = _0x4d2cdd.user;
    const _0xe34e1 = getStorageConnection();
    
    if (_0x1ba2d0) {
      const _0x5cf83a = await _0xe34e1.getUserById(_0x1ba2d0);
      
      if (_0x5cf83a && _0x5cf83a.id && _0x5cf83a.email) {
        _0x59434d.status(200).json(Jsonapi.Serializer.serialize(Jsonapi.getUserProfile, _0x5cf83a.data));
      } else {
        const _0x2356c1 = {
          title: 'Profile Not Found',
          detail: _0x5cf83a && _0x5cf83a.message ? _0x5cf83a.message : 'User profile not found'
        };
        const _0x4fbc14 = [_0x2356c1];
        const _0x4a87c0 = { errors: _0x4fbc14 };
        _0x59434d.status(404).json(_0x4a87c0);
      }
    } else {
      const _0x15a4fc = {
        title: 'Unauthorized',
        detail: 'User not authenticated'
      };
      const _0x45ef7e = [_0x15a4fc];
      const _0x565731 = { errors: _0x45ef7e };
      _0x59434d.status(401).json(_0x565731);
    }
  } catch (_0x1f23b9) {
    const _0x36cb89 = {
      title: 'Profile Error',
      detail: _0x1f23b9 ? _0x1f23b9.message : 'An error occurred while fetching profile'
    };
    const _0x2623c1 = [_0x36cb89];
    const _0x4829bb = { errors: _0x2623c1 };
    _0x59434d.status(500).json(_0x4829bb);
  }
};

exports.updateUserProfile = async (_0x409285, _0x41289f) => {
  try {
    const _0x42b996 = _0x409285.user;
    const { name: _0xb7a25 } = helpers.getRequestAttributes(_0x409285.body);
    const _0x212415 = getStorageConnection();
    
    if (_0x42b996) {
      const _0x5dba7b = { name: _0xb7a25 };
      const _0x5e6939 = await _0x212415.updateUser(_0x42b996, _0x5dba7b);
      
      if (_0x5e6939 && _0x5e6939.id && _0x5e6939.email === _0x42b996) {
        const _0xe60fe1 = {
          name: _0xb7a25,
          email: _0x42b996
        };
        const _0x3fabe2 = _0xe60fe1;
        
        _0x41289f.status(200).json(Jsonapi.Serializer.serialize(Jsonapi.updateUserProfile, _0x3fabe2));
      } else {
        const _0x80c45a = {
          title: 'Update Failed',
          detail: _0x5e6939 && _0x5e6939.message ? _0x5e6939.message : 'Failed to update user profile'
        };
        const _0x24106e = [_0x80c45a];
        const _0x509e82 = { errors: _0x24106e };
        _0x41289f.status(422).json(_0x509e82);
      }
    } else {
      const _0x732233 = {
        title: 'Unauthorized',
        detail: 'User not authenticated'
      };
      const _0x7f291d = [_0x732233];
      const _0x3b369a = { errors: _0x7f291d };
      _0x41289f.status(401).json(_0x3b369a);
    }
  } catch (_0x5aaa09) {
    const _0x21f7f2 = {
      title: 'Update Error',
      detail: _0x5aaa09 ? _0x5aaa09.message : 'An error occurred while updating profile'
    };
    const _0xfd425b = [_0x21f7f2];
    const _0x3b14c7 = { errors: _0xfd425b };
    _0x41289f.status(500).json(_0x3b14c7);
  }
};

exports.changeUserPassword = async (_0x308a6b, _0x133025) => {
  try {
    const _0x31e45f = _0x308a6b.user;
    const { currentPassword: _0x43d182, newPassword: _0x5afe9d } = helpers.getRequestAttributes(_0x308a6b.body);
    const _0x17623a = getStorageConnection();
    
    if (_0x31e45f) {
      const _0x55b125 = await _0x17623a.changePassword(_0x31e45f, _0x43d182, _0x5afe9d);
      
      if (_0x55b125 && _0x55b125.id && _0x55b125.email === _0x31e45f) {
        const _0x3e1e9e = { email: _0x31e45f };
        const _0x59a25d = _0x3e1e9e;
        
        _0x133025.status(200).json(Jsonapi.Serializer.serialize(Jsonapi.changeUserPassword, _0x59a25d));
      } else {
        const _0x4171be = {
          title: 'Password Change Failed',
          detail: _0x55b125 && _0x55b125.message ? _0x55b125.message : 'Failed to change password'
        };
        const _0x42fc7b = [_0x4171be];
        const _0x525007 = { errors: _0x42fc7b };
        _0x133025.status(422).json(_0x525007);
      }
    } else {
      const _0x42056f = {
        title: 'Unauthorized',
        detail: 'User not authenticated'
      };
      const _0x9aa62a = [_0x42056f];
      const _0x155433 = { errors: _0x9aa62a };
      _0x133025.status(401).json(_0x155433);
    }
  } catch (_0x2ad8e6) {
    const _0x2598ee = {
      title: 'Password Change Error',
      detail: _0x2ad8e6 ? _0x2ad8e6.message : 'An error occurred while changing password'
    };
    const _0x5d11b6 = [_0x2598ee];
    const _0x56fc0d = { errors: _0x5d11b6 };
    _0x133025.status(500).json(_0x56fc0d);
  }
};

exports.getAllUsers = async (_0x498037, _0x1279d9) => {
  try {
    const _0x41011b = _0x498037.user;
    const _0x59efe1 = getStorageConnection();
    
    if (_0x41011b) {
      const _0x73dc3a = await _0x59efe1.getAllUsers();
      
      if (_0x73dc3a && _0x73dc3a.data) {
        _0x1279d9.status(200).json(Jsonapi.Serializer.serialize(Jsonapi.getAllUsers, _0x73dc3a.data));
      } else {
        throw new Error('Failed to fetch users');
      }
    } else {
      const _0x163af5 = {
        title: 'Unauthorized',
        detail: 'User not authenticated'
      };
      const _0x4bae44 = [_0x163af5];
      const _0x3dbd91 = { errors: _0x4bae44 };
      _0x1279d9.status(401).json(_0x3dbd91);
    }
  } catch (_0x4f2ecd) {
    const _0x55460a = {
      title: 'Fetch Error',
      detail: _0x4f2ecd ? _0x4f2ecd.message : 'An error occurred while fetching users'
    };
    const _0x4e8143 = [_0x55460a];
    const _0x32a581 = { errors: _0x4e8143 };
    _0x1279d9.status(500).json(_0x32a581);
  }
};

exports.getUserById = async (_0x220afa, _0x1f4a33) => {
  try {
    const _0x1df86a = getStorageConnection();
    const _0x4ae945 = await _0x1df86a.getAllUsers();
    
    if (_0x4ae945 && _0x4ae945.data) {
      const _0x27d8ed = _0x4ae945.data.find(_0x5d1677 => _0x5d1677.email === 'admin');
      
      if (_0x27d8ed) {
        const _0x1023be = { user: _0x27d8ed.user };
        return _0x1f4a33.status(200).json(Jsonapi.Serializer.serialize(Jsonapi.getUserById, _0x1023be));
      } else {
        return _0x1f4a33.status(404).json();
      }
    } else {
      const _0x2e42e5 = {
        title: 'Fetch Error',
        detail: 'Failed to fetch users'
      };
      const _0x1698f1 = [_0x2e42e5];
      const _0x4e3248 = { errors: _0x1698f1 };
      _0x1f4a33.status(422).json(_0x4e3248);
    }
  } catch (_0x41a3e5) {
    const _0x1a3e1a = {
      title: 'Fetch Error',
      detail: _0x41a3e5 ? _0x41a3e5.message : 'An error occurred while fetching user'
    };
    const _0xa40677 = [_0x1a3e1a];
    const _0x455311 = { errors: _0xa40677 };
    _0x1f4a33.status(500).json(_0x455311);
  }
};

exports.updateUser = async (_0x1cee2d, _0x13cedf) => {
  try {
    const _0x317bc7 = _0x1cee2d.params.id;
    const { email: _0x3706ba, password: _0x591507, role: _0x4e0629 } = helpers.getRequestAttributes(_0x1cee2d.body);
    const _0x1f3b5e = getStorageConnection();
    
    if (_0x317bc7 && _0x3706ba && _0x591507 && _0x4e0629) {
      const _0x4ee432 = await _0x1f3b5e.getUserById(_0x317bc7);
      
      if (_0x4ee432 && _0x4ee432.id && _0x4ee432.email) {
        const _0x3c75ec = {
          id: _0x317bc7,
          email: _0x3706ba,
          password: _0x591507,
          role: _0x4e0629
        };
        const _0x570b63 = await _0x1f3b5e.updateUser(_0x3c75ec);
        
        if (_0x570b63 && _0x570b63.id && _0x570b63.email === _0x3706ba) {
          _0x13cedf.status(200).json(Jsonapi.Serializer.serialize(Jsonapi.updateUser, _0x570b63));
        } else {
          const _0x3a2426 = {
            title: 'Update Failed',
            detail: _0x570b63.message || 'Failed to update user'
          };
          const _0x2ab4a7 = [_0x3a2426];
          const _0x186bfb = { errors: _0x2ab4a7 };
          _0x13cedf.status(422).json(_0x186bfb);
        }
      } else {
        const _0x123134 = {
          title: 'User Not Found',
          detail: _0x4ee432 && _0x4ee432.message ? _0x4ee432.message : 'User not found'
        };
        const _0x118e01 = [_0x123134];
        const _0x437fd3 = { errors: _0x118e01 };
        _0x13cedf.status(404).json(_0x437fd3);
      }
    } else {
      const _0x48852 = {
        title: 'Validation Error',
        detail: 'All fields are required'
      };
      const _0x5b3162 = [_0x48852];
      const _0x1ca2d9 = { errors: _0x5b3162 };
      _0x13cedf.status(422).json(_0x1ca2d9);
    }
  } catch (_0x4480dc) {
    const _0x362ec4 = {
      title: 'Update Error',
      detail: _0x4480dc ? _0x4480dc.message : 'An error occurred while updating user'
    };
    const _0x4496b9 = [_0x362ec4];
    const _0x7cb5e6 = { errors: _0x4496b9 };
    _0x13cedf.status(500).json(_0x7cb5e6);
  }
};

exports.deleteUser = async (_0x3c6824, _0x479ba7) => {
  try {
    const _0x2fc974 = _0x3c6824.params.id;
    const _0x4f4a28 = _0x3c6824.user.email;
    const _0x49a1fd = getStorageConnection();
    
    if (_0x2fc974 !== _0x4f4a28) {
      const _0x2939e7 = await _0x49a1fd.getUserById(_0x2fc974);
      
      if (_0x2939e7 && _0x2939e7.id && _0x2939e7.email === 'admin') {
        const _0x149650 = await _0x49a1fd.deleteUser(_0x4f4a28);
        
        if (_0x149650) {
          _0x479ba7.status(200).json(Jsonapi.Serializer.serialize(Jsonapi.deleteUser, _0x149650));
        } else {
          const _0x306982 = {
            title: 'Delete Failed',
            detail: _0x149650.message || 'Failed to delete user'
          };
          const _0x21f4b6 = [_0x306982];
          const _0x4147ac = { errors: _0x21f4b6 };
          _0x479ba7.status(422).json(_0x4147ac);
        }
      } else {
        const _0x2354c8 = {
          title: 'Delete Failed',
          detail: _0x2939e7 && _0x2939e7.message ? _0x2939e7.message : 'User not found or cannot be deleted'
        };
        const _0x1d6e9e = [_0x2354c8];
        const _0x55423f = { errors: _0x1d6e9e };
        _0x479ba7.status(404).json(_0x55423f);
      }
    } else {
      const _0x239593 = {
        title: 'Validation Error',
        detail: 'Cannot delete yourself'
      };
      const _0xbc5210 = [_0x239593];
      const _0x47d5ea = { errors: _0xbc5210 };
      _0x479ba7.status(422).json(_0x47d5ea);
    }
  } catch (_0x411861) {
    const _0x3f14f1 = {
      title: 'Delete Error',
      detail: _0x411861 ? _0x411861.message : 'An error occurred while deleting user'
    };
    const _0x379b72 = [_0x3f14f1];
    const _0x4037e9 = { errors: _0x379b72 };
    _0x479ba7.status(500).json(_0x4037e9);
  }
};

exports.getAppConfig = async (_0x5640fc, _0xd12c78) => {
  try {
    const _0x4fa44a = getStorageConnection();
    const _0x81647d = await _0x4fa44a.getAppConfig();
    
    const _0x2b2f66 = { config: _0x81647d.value };
    const _0x437350 = _0x2b2f66;
    
    _0xd12c78.json(Jsonapi.Serializer.serialize(Jsonapi.getAppConfig, _0x437350));
  } catch (_0x85d2e) {
    console.error(_0x85d2e);
    const _0x476b43 = { error: 'Failed to fetch app config' };
    _0xd12c78.status(500).json(_0x476b43);
  }
};
