
// lookup aggregation

// syntax

/*
    {
        $lookup:
        {
            from: <collection to join>,
            localField: <field from the input documents>,
            foreignField: <field from the documents of the "from" collection>, 
            as: <output array field>
        }
    }

 */


 // here we are taking example of students, teachers, courses and classes collections which is available in data.js file


 db.courses.aggregate([
    {
        $lookup: {
            from: "teachers",
            localField: "id",
            foreignField: "teacherId",
            as: "teacherDetails"
        }
    }
 ]).pretty()



 // projection by $project operator

 db.teachers.aggregate([
    {
        $project: {
            id:0,
            firstName: 1,
            lastName: 1,
            email: 1,
            dept: "$department"
        }
    }
 ]).pretty()


 // capped collection

// it creates a capped collection for order_logs collection where max and size is user defined, and after inserted 11th document in collection it will delete the first document from collection with maintaning max limit of 10

 db.createCollection("order_logs", { capped: true, max:10, size: 100000 }) 


 