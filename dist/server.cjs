"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/app.ts
var import_express3 = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);

// src/utils/sendResponse.ts
var sendResponse = (res, responseData) => {
  res.status(responseData.statusCode).json({
    success: responseData.success,
    message: responseData.message,
    data: responseData.data,
    errors: responseData.errors
  });
};
var sendResponse_default = sendResponse;

// src/middleware/globalErrorHandler.ts
var globalErrorHandler = (errors, req, res, next) => {
  sendResponse_default(res, {
    statusCode: 500,
    success: false,
    message: errors.message || "Internal Server Error",
    errors
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/config/index.ts
var import_dotenv = __toESM(require("dotenv"), 1);
var import_path = __toESM(require("path"), 1);
import_dotenv.default.config({
  path: import_path.default.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.DATABASE_URL,
  port: process.env.PORT,
  secret: process.env.JWT_SECRET_KEY,
  client_url: process.env.CLIENT_URL
};
var config_default = config;

// src/modules/auth/auth.route.ts
var import_express = require("express");

// src/db/index.ts
var import_pg = require("pg");
var pool = new import_pg.Pool({
  connectionString: config_default.connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'contributor',

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )
        `);
    await pool.query(`
            CREATE TABLE IF NOT EXISTS issues(
            id SERIAL PRIMARY KEY,
            title VARCHAR(150) NOT NULL,
            description TEXT NOT NULL,
            type VARCHAR(20) NOT NULL,
            status VARCHAR(20) DEFAULT 'open',
            reporter_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )
        `);
    console.log("Database connected successfully!");
  } catch (errors) {
    console.log(errors);
  }
};

// src/modules/auth/auth.service.ts
var import_bcrypt = __toESM(require("bcrypt"), 1);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var createUserIntoDB = async (payload) => {
  const { name, email, password, role } = payload;
  const hashPassword = await import_bcrypt.default.hash(password, 10);
  const existing = await pool.query(
    `SELECT id FROM users WHERE email = $1`,
    [email]
  );
  if (existing.rows.length > 0) {
    throw new Error("Email already exists");
  }
  const result = await pool.query(
    `
        INSERT INTO users (name, email, password, role) VALUES($1,$2,$3,COALESCE($4,'contributor'))
        RETURNING id, name, email, role, created_at, updated_at
        `,
    [name, email, hashPassword, role]
  );
  return result;
};
var loginUserIntoDB = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(
    `
            SELECT id, name, email, role, password, created_at, updated_at FROM users WHERE email=$1
            `,
    [email]
  );
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials!");
  }
  const user = userData.rows[0];
  const matchPassword = await import_bcrypt.default.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid Credentials!");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email
  };
  const token = import_jsonwebtoken.default.sign(jwtPayload, config_default.secret, {
    expiresIn: "1d"
  });
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    }
  };
};
var authService = {
  createUserIntoDB,
  loginUserIntoDB
};

// src/modules/auth/auth.controller.ts
var signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return sendResponse_default(res, {
        statusCode: 400,
        success: false,
        message: "All fields are required"
      });
    }
    const result = await authService.createUserIntoDB(req.body);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result.rows[0]
    });
  } catch (errors) {
    next(errors);
  }
};
var login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendResponse_default(res, {
        statusCode: 400,
        success: false,
        message: "Email and password are required"
      });
    }
    const result = await authService.loginUserIntoDB(req.body);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (errors) {
    next(errors);
  }
};
var authController = {
  signup,
  login
};

// src/modules/auth/auth.route.ts
var router = (0, import_express.Router)();
router.post("/signup", authController.signup);
router.post("/login", authController.login);
var authRoute = router;

// src/modules/issue/issue.route.ts
var import_express2 = require("express");

// src/modules/issue/issue.service.ts
var createIssueIntoDB = async (payload, reporter_id) => {
  const { title, description, type } = payload;
  const result = await pool.query(
    `
        INSERT INTO issues(title,description,type,reporter_id)
        VALUES($1, $2, $3, $4 )
        RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
    `,
    [title, description, type, reporter_id]
  );
  return result;
};
var getAllIssueFromDB = async (query) => {
  const conditions = [];
  const values = [];
  if (query.type) {
    values.push(query.type);
    conditions.push(`type = $${values.length}`);
  }
  if (query.status) {
    values.push(query.status);
    conditions.push(`status = $${values.length}`);
  }
  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderBy = query.sort === "oldest" ? "ASC" : "DESC";
  const issuesResult = await pool.query(`
        SELECT id, title, description, type, status, reporter_id, created_at, updated_at 
        FROM issues
        ${whereClause}
        ORDER BY created_at ${orderBy}
    `, values);
  const issues = issuesResult.rows;
  if (issues.length === 0) return [];
  const reporterIds = issues.map((issue) => issue.reporter_id);
  const reportersResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = ANY($1)`,
    [reporterIds]
  );
  const resultData = issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: reportersResult.rows.find((r) => r.id === issue.reporter_id),
    created_at: issue.created_at,
    updated_at: issue.updated_at
  }));
  return resultData;
};
var getSingleIssueFromDB = async (id) => {
  const result = await pool.query(
    `

        SELECT id, title, description, type, status, reporter_id, created_at, updated_at 
        FROM issues WHERE id = $1 
        
        `,
    [id]
  );
  const issue = result.rows[0];
  if (!issue) return null;
  const reporterResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = $1`,
    [issue.reporter_id]
  );
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: reporterResult.rows[0],
    created_at: issue.created_at,
    updated_at: issue.updated_at
  };
};
var updateIssueFromDB = async (payload, id, userId, userRole) => {
  const { title, description, type, status } = payload;
  const issueResult = await pool.query(
    `SELECT * FROM issues WHERE id = $1`,
    [id]
  );
  const issue = issueResult.rows[0];
  if (!issue) return null;
  if (userRole === "contributor") {
    if (issue.reporter_id !== userId) {
      throw new Error("FORBIDDEN");
    }
    if (issue.status !== "open") {
      throw new Error("CONFLICT");
    }
  }
  const result = await pool.query(
    `
        UPDATE issues 
        SET 
        title=COALESCE($1,title),
        description=COALESCE($2,description),
        type=COALESCE($3,type),
        status=COALESCE($4,status),
        updated_at = NOW()

        WHERE id=$5 
        RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
        `,
    [title, description, type, status, id]
  );
  return result.rows[0];
};
var deleteIssueFromDB = async (id) => {
  const result = await pool.query(
    `
        DELETE FROM issues WHERE id=$1  
        `,
    [id]
  );
  if (result.rowCount === 0) return null;
  return result;
};
var issueService = {
  createIssueIntoDB,
  getAllIssueFromDB,
  getSingleIssueFromDB,
  updateIssueFromDB,
  deleteIssueFromDB
};

// src/modules/issue/issue.controller.ts
var createIssue = async (req, res, next) => {
  try {
    const reporter_id = req.user.id;
    const { title, description, type } = req.body;
    if (!title || !description || !type) {
      return sendResponse_default(res, {
        statusCode: 400,
        success: false,
        message: "All fields are required"
      });
    }
    if (title.length > 150) {
      return sendResponse_default(res, {
        statusCode: 400,
        success: false,
        message: "Title must not exceed 150 characters"
      });
    }
    if (description.length < 20) {
      return sendResponse_default(res, {
        statusCode: 400,
        success: false,
        message: "Description must be at least 20 characters"
      });
    }
    if (!["bug", "feature_request"].includes(type)) {
      return sendResponse_default(res, {
        statusCode: 400,
        success: false,
        message: "Type must be bug or feature_request"
      });
    }
    const result = await issueService.createIssueIntoDB(req.body, reporter_id);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result.rows[0]
    });
  } catch (errors) {
    next(errors);
  }
};
var getAllIssues = async (req, res, next) => {
  try {
    const result = await issueService.getAllIssueFromDB(req.query);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      data: result
    });
  } catch (errors) {
    next(errors);
  }
};
var getSingleIssue = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await issueService.getSingleIssueFromDB(id);
    if (!result) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found"
      });
    }
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      data: result
    });
  } catch (errors) {
    next(errors);
  }
};
var updateIssue = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await issueService.updateIssueFromDB(
      req.body,
      id,
      req.user.id,
      req.user.role
    );
    if (!result) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
        data: result
      });
    }
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result
    });
  } catch (errors) {
    if (errors instanceof Error) {
      if (errors.message === "FORBIDDEN") {
        return sendResponse_default(res, {
          statusCode: 403,
          success: false,
          message: "You are not allowed to update this issue"
        });
      }
      if (errors.message === "CONFLICT") {
        return sendResponse_default(res, {
          statusCode: 409,
          success: false,
          message: "Only open issues can be updated"
        });
      }
    }
    next(errors);
  }
};
var deleteIssue = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await issueService.deleteIssueFromDB(id);
    if (!result) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
        data: result
      });
    }
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (errors) {
    next(errors);
  }
};
var issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/middleware/auth.ts
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"), 1);
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return sendResponse_default(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized!"
        });
      }
      const decoded = import_jsonwebtoken2.default.verify(
        token,
        config_default.secret
      );
      const userData = await pool.query(
        `
            SELECT id, name, email, role FROM users WHERE id=$1   
                `,
        [decoded.id]
      );
      const user = userData.rows[0];
      if (userData.rows.length === 0) {
        return sendResponse_default(res, {
          statusCode: 404,
          success: false,
          message: "User not found!"
        });
      }
      if (roles.length && !roles.includes(user.role)) {
        return sendResponse_default(res, {
          statusCode: 403,
          success: false,
          message: "Forbidden!!,This role have no access!"
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth;

// src/modules/issue/issue.route.ts
var router2 = (0, import_express2.Router)();
router2.post("/", auth_default("contributor", "maintainer"), issueController.createIssue);
router2.get("/", issueController.getAllIssues);
router2.get("/:id", issueController.getSingleIssue);
router2.patch("/:id", auth_default("contributor", "maintainer"), issueController.updateIssue);
router2.delete("/:id", auth_default("maintainer"), issueController.deleteIssue);
var issueRoute = router2;

// src/app.ts
var app = (0, import_express3.default)();
app.use(import_express3.default.json());
app.use(
  (0, import_cors.default)({
    origin: config_default.client_url || "http://localhost:3000"
  })
);
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Express Server",
    author: "Md. Nazmus Shakib"
  });
});
app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoute);
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
var main = async () => {
  await initDB();
  app_default.listen(config_default.port, () => {
    console.log(`Express server is running on port ${config_default.port}`);
  });
};
main();
