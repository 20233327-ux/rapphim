# Default Credentials

## Demo/Testing Accounts

These default accounts are created when seeding the database. They are for **development and testing only**.

### Admin Account
- **Email**: `admin@cinema.com`
- **Password**: `Admin@123`
- **Role**: Admin (full access to all modules)

### Staff Account
- **Email**: `staff@cinema.com`
- **Password**: `Staff@123`
- **Role**: Staff (limited access for cinema operations)

## Security Notes

- **⚠️ Important**: Change these passwords immediately in production environments
- The passwords are hashed using bcrypt (rounds: 10) before storage
- Never commit plaintext passwords to version control
- Use environment variables for sensitive credentials

## Production Setup

For production deployments:
1. Disable database seeding by setting `DB_RUN_SEED=false` in environment variables
2. Create admin accounts manually with strong passwords
3. Use a separate user management system with proper access controls
4. Never use demo credentials in production

## Changing Passwords

To change a user's password in production:

### Via API (if implemented)
POST `/api/users/{userId}/password`
```json
{
  "currentPassword": "current_pass",
  "newPassword": "new_strong_password"
}
```

### Direct Database Update
```sql
-- Generate new bcrypt hash with: bcrypt.hash('newpassword', 10)
UPDATE users 
SET password_hash = '$2a$10$...' 
WHERE email = 'admin@cinema.com';
```

## Troubleshooting Login Issues

- **"Invalid credentials"**: Double-check email and password spelling
- **Empty password_hash**: Ensure `DB_RUN_SEED=true` or seed migration has run
- **Plaintext auth in dev**: Set `AUTH_ALLOW_PLAINTEXT_DEV=true` and `AUTH_DEV_PASSWORD=123456` for testing
