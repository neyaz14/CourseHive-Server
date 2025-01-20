# CourseHive Server

CourseHive Server is the backend service for the CourseHive platform, providing APIs for course management, user authentication, role-based access control, and payment processing.


## Project Links
- **Client Repository**:  https://github.com/Programming-Hero-Web-Course4/b10a12-client-side-neyaz14
- **Server Repository**: https://github.com/Programming-Hero-Web-Course4/b10a12-server-side-neyaz14
- **Live Site**: https://simple-firebase-4327b.web.app/


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



