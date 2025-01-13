# CourseHive Server

CourseHive Server is the backend service for the CourseHive platform, providing APIs for course management, user authentication, role-based access control, and payment processing.


## Project Links
- **Client Repository**: [CourseHive Client](https://github.com/yourusername/coursehive-client)
- **Server Repository**: [CourseHive Server](https://github.com/yourusername/coursehive-server)
- **Live Site**: [CourseHive Live](https://coursehive.example.com)


## Features



### Technologies Used
- **Backend**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Token) for secure token-based authentication
- **Payment**: Stripe for payment processing

### CRUD Operations
- **Courses**:
  - **Create**: Add new courses submitted by teachers.
  - **Read**: Retrieve course details for students and teachers.
  - **Update**: Modify course details by teachers (upon approval).
  - **Delete**: Remove courses when necessary.

### Role Management
- **Admin**: Full access to manage users, courses, and system settings.
- **Teacher**: Can create and manage their courses.
- **Student**: Can purchase and view enrolled courses.

### Payment Processing
- **Stripe Integration**: Secure backend for handling course payments.



## Contributing
Contributions are welcome! Please fork the repository and submit a pull request for any feature additions or bug fixes.



