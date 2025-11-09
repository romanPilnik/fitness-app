---
inclusion: manual
---

<!------------------------------------------------------------------------------------
   # JSDoc Standards - Fitness App

## General Rules

1. Every exported function MUST have JSDoc
2. Focus on business context, not implementation
3. Document errors, edge cases, and side effects explicitly
4. Use consistent types from Type Definitions
5. Include examples for complex functions only

---

## Controllers

HTTP handlers - focus on route details, access control, API contract.

```javascript
/**
 * @desc    [What endpoint does]
 * @route   [METHOD] [/api/path]
 * @access  [Public/Private/Private(Admin)]
 * @query   [paramName] - [Description]
 * @param   {Type} req.params.[name] - [Description]
 * @body    {Type} req.body.[field] - [Description]
 * @returns {Object} [Response structure]
 * @throws  {Number} [statusCode] - [When/why]
 */
const getExercises = async (req, res, next) => { ... }
```

**Example:**
```javascript
/**
 * @desc    Create new program template
 * @route   POST /api/v1/templates
 * @access  Private (Admin)
 * @body    {string} req.body.name - Template name
 * @body    {number} req.body.daysPerWeek - Training days per week
 * @body    {Array} req.body.workouts - Workout definitions
 * @returns {Object} { success, message, data: template }
 * @throws  {400} Validation error
 * @throws  {409} Template name already exists
 */
```

---

## Services

Business logic - describe what function does at business level, parameters, returns, and business rule violations.

```javascript
/**
 * [Business-level description]
 *
 * [Optional: Additional context about business rules or behavior]
 *
 * @param {Type} paramName - [Business meaning]
 * @param {Type} [optionalParam] - [Description]
 * @returns {Promise<Type>} [What gets returned]
 * @throws {ErrorType} [When/why]
 *
 * @example
 * [Realistic usage - only for complex functions]
 */
```

**Examples:**
```javascript
/**
 * Registers a new user in the database
 * @param {string} email - User's email address
 * @param {string} password - Plain text password (hashed by model)
 * @param {string} name - User's full name
 * @returns {Promise<User>} Created user document
 * @throws {Error} 409 - User with email already exists
 * @throws {ValidationError} Invalid data
 */
const registerUser = async (email, password, name) => { ... }

/**
 * Create user program from template
 *
 * Copies template to user's program and initializes tracking.
 * User must not have an existing active program.
 *
 * @param {mongoose.Types.ObjectId} userId - User's ID
 * @param {mongoose.Types.ObjectId} templateId - Template to copy
 * @param {Object} [customizations={}] - Optional modifications
 * @returns {Promise<UserProgram>} Created program
 * @throws {Error} 404 - Template not found
 * @throws {Error} 409 - User already has active program
 *
 * @example
 * const program = await createProgramFromTemplate(
 *   userId,
 *   templateId,
 *   { name: 'My Custom PPL' }
 * );
 */
```

---

## Routes

API surface - HTTP method, path, parameters, grouping.

```javascript
/**
 * [METHOD] [/api/path]
 * @route [METHOD] [/path]
 * @group [Feature] - [Description]
 * @param {Type} [name].[location].[required/optional] - [Description]
 * @returns {Object} [statusCode] - [Response description]
 * @security [Auth requirements]
 */
```

**Example:**
```javascript
/**
 * POST /api/v1/programs/from-template
 * @route POST /from-template
 * @group Program - User program management
 * @param {string} templateId.body.required - Template ID
 * @param {Object} customizations.body.optional - Modifications
 * @returns {Object} 201 - Program created
 * @returns {Object} 404 - Template not found
 * @returns {Object} 409 - User has active program
 * @security Bearer token required
 */
router.post("/from-template", verifyToken, controller.createFromTemplate);
```

---

## Middleware

Functions that transform requests or enforce policies.

```javascript
/**
 * [What middleware does]
 *
 * @param {...Type} [paramName] - [For factories returning middleware]
 * @returns {Function} Express middleware
 *
 * @example
 * [Usage in route]
 */
```

**Examples:**
```javascript
/**
 * Role-based authorization middleware
 * Checks if authenticated user has required role(s)
 *
 * @param {...string} allowedRoles - Roles that can access route
 * @returns {Function} Express middleware
 *
 * @example
 * router.post('/admin', verifyToken, requireRole('admin'), controller)
 */
function requireRole(...allowedRoles) { ... }

/**
 * Resource ownership verification
 * Attaches resource to req.resource if user owns it
 *
 * @param {Model} Model - Mongoose model to query
 * @param {string} [foreignKey="userId"] - Owner ID field name
 * @returns {Function} Express middleware
 *
 * @example
 * router.patch('/:id', verifyToken, verifyOwnership(UserProgram), controller)
 */
const verifyOwnership = (Model, foreignKey = "userId") => { ... }
```

---

## Models

### Instance Methods
```javascript
/**
 * [What method does]
 *
 * @param {Type} paramName - [Description]
 * @returns {Type} [Description]
 *
 * @example
 * [Only if complex]
 */
```

**Examples:**
```javascript
/**
 * Calculate progression success rate
 * Returns 0 if no attempts made.
 *
 * @returns {number} Percentage (0-100, 1 decimal)
 *
 * @example
 * const rate = profile.getProgressionRate();
 * // Returns: 66.7 (2 successes / 3 attempts)
 */
userExerciseProfileSchema.methods.getProgressionRate = function() { ... }

/**
 * Update with latest session data
 * Does not save - caller must call save().
 *
 * @param {Object} sessionData - Performance data
 * @param {number} sessionData.weight - Weight used
 * @param {number} sessionData.reps - Reps completed
 * @param {number} sessionData.sets - Sets completed
 * @param {number} sessionData.rir - RIR on top set
 * @returns {UserExerciseProfile} Returns this for chaining
 * @throws {Error} Missing required fields
 */
userExerciseProfileSchema.methods.updateLastPerformed = function(sessionData) { ... }
```

### Static Methods
```javascript
/**
 * [What static method does]
 *
 * @static
 * @param {Type} paramName - [Description]
 * @returns {Promise<Type>} [Description]
 * @throws {Error} [When/why]
 */
```

**Example:**
```javascript
/**
 * Find or create user exercise profile
 * Creates with defaults if doesn't exist.
 *
 * @static
 * @param {mongoose.Types.ObjectId} userId - User's ID
 * @param {mongoose.Types.ObjectId} exerciseId - Exercise ID
 * @returns {Promise<UserExerciseProfile>} Existing or new profile
 * @throws {Error} Missing userId or exerciseId
 */
userExerciseProfileSchema.statics.getOrCreateProfile = async function(userId, exerciseId) { ... }
```

### Virtuals
```javascript
/**
 * [What this calculates]
 *
 * @virtual
 * @returns {Type} [Description]
 */
```

**Example:**
```javascript
/**
 * Calculate program completion percentage
 *
 * @virtual
 * @returns {number} Percentage (0-100)
 */
userProgramSchema.virtual('progressPercentage').get(function() { ... });
```

---

## Utilities

```javascript
/**
 * [What utility does]
 *
 * @param {Type} paramName - [Description]
 * @param {Type} [optionalParam=default] - [Description]
 * @returns {Type} [Description]
 */
```

**Example:**
```javascript
/**
 * Parse and validate pagination parameters
 * @param {Object} query - req.query object
 * @param {number} [defaultLimit=20] - Default items per page
 * @param {number} [maxLimit=100] - Maximum items per page
 * @returns {Object} { page, limit, skip }
 */
const parsePaginationParams = (query, defaultLimit = 20, maxLimit = 100) => { ... }
```

---

## Type Definitions

**Standard Types:**
- `{string}`, `{number}`, `{boolean}`, `{Object}`, `{Array}`
- `{Type[]}` - Array of type (e.g., `{string[]}`)
- `{Type|null}` - Nullable
- `{Promise<Type>}` - Async return
- `{Function}` - Function type

**App-Specific Types:**
- `{mongoose.Types.ObjectId}` - MongoDB ID
- `{mongoose.Model}` - Mongoose model
- `{Exercise}`, `{UserProgram}`, `{ProgramTemplate}`, `{WorkoutSession}`, `{User}`, `{UserExerciseProfile}` - Model instances

---

## What to Document

**ALWAYS:**
- Public API endpoints (routes + controllers)
- Service functions (business logic)
- Model methods (instance, static, virtuals)
- Middleware
- Utilities
- Error conditions

**SOMETIMES:**
- Private helpers (if complex)
- Database hooks (if non-obvious)

**NEVER:**
- Trivial one-liners
- Self-explanatory code
- Generated code

---

## Common Patterns

**Optional Parameters:**
```javascript
@param {number} [limit=20] - Items per page
@param {Object} [options] - Optional config
```

**Destructured Parameters:**
```javascript
@param {Object} exerciseData - Exercise details
@param {string} exerciseData.name - Exercise name
@param {string} exerciseData.equipment - Equipment type
```

**Error Documentation:**
```javascript
@throws {ValidationError} When input invalid
@throws {DuplicateError} When resource exists
@throws {NotFoundError} When resource not found
@throws {AuthorizationError} When lacking permission
```

---

## Anti-Patterns

❌ **Too Vague:**
```javascript
/**
 * Gets exercises
 * @param {Object} filters
 * @returns {Array}
 */
```

❌ **Repeating Code:**
```javascript
/**
 * Finds exercises by ID
 * @param {string} id - the id
 */
const getExerciseById = async (id) => { ... }
```

❌ **Missing Critical Info:**
```javascript
/**
 * Create exercise
 * @param {Object} data
 * @returns {Object}
 */
// Missing: What throws? What's in data? What's in return?
```

✅ **Good:**
```javascript
/**
 * Retrieve exercise by ID
 *
 * @param {string} id - MongoDB ObjectId
 * @returns {Promise<Exercise|null>} Exercise or null if not found
 * @throws {ValidationError} Invalid ID format
 */
```

---

## AI Instructions

When generating JSDoc:
1. Identify layer (Controller/Service/Route/Middleware/Model/Utility)
2. Use appropriate template above
3. Focus on business context, not implementation
4. Document errors explicitly
5. Add examples only for complex functions
6. Use types from Type Definitions
7. Be concise but complete
------------------------------------------------------------------------------------->
