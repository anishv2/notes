

export const collegeData={
    "students": [
      {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe",
        "dateOfBirth": "2005-03-15",
        "email": "john.doe@example.com",
        "enrollments": [
          {
            "courseId": 101,
            "grade": "A"
          },
          {
            "courseId": 102,
            "grade": "B"
          }
        ]
      },
      {
        "id": 2,
        "firstName": "Jane",
        "lastName": "Smith",
        "dateOfBirth": "2004-07-22",
        "email": "jane.smith@example.com",
        "enrollments": [
          {
            "courseId": 101,
            "grade": "B"
          },
          {
            "courseId": 103,
            "grade": "A"
          }
        ]
      }
    ],
    "courses": [
      {
        "id": 101,
        "title": "Mathematics",
        "description": "An introduction to basic mathematics.",
        "teacherId": 1
      },
      {
        "id": 102,
        "title": "History",
        "description": "A survey of world history.",
        "teacherId": 2
      },
      {
        "id": 103,
        "title": "Science",
        "description": "Exploring the fundamentals of science.",
        "teacherId": 3
      }
    ],
    "teachers": [
      {
        "id": 1,
        "firstName": "Emily",
        "lastName": "Johnson",
        "email": "emily.johnson@example.com",
        "department": "Mathematics"
      },
      {
        "id": 2,
        "firstName": "Michael",
        "lastName": "Brown",
        "email": "michael.brown@example.com",
        "department": "History"
      },
      {
        "id": 3,
        "firstName": "Sarah",
        "lastName": "Davis",
        "email": "sarah.davis@example.com",
        "department": "Science"
      }
    ],
    "classes": [
      {
        "id": 1,
        "courseId": 101,
        "room": "101",
        "schedule": "Monday 10:00-11:30"
      },
      {
        "id": 2,
        "courseId": 102,
        "room": "102",
        "schedule": "Wednesday 09:00-10:30"
      },
      {
        "id": 3,
        "courseId": 103,
        "room": "103",
        "schedule": "Friday 11:00-12:30"
      }
    ]
}
  