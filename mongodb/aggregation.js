
// aggregation
// Note: here we are taking an example of student collection

db.students.aggregate([{ $group:{_id: '$age' }}]) // returns only ids of group by age

db.students.aggregate([{ $group:{_id: '$age', students: { $push: '$$ROOT' }}}])  // returns ids of group by age with entire documents 

db.students.aggregate([{ $match: { gender: "male" }}, { $group: { _id: "$age", countOfStudents: { $sum: 1 }}}]) // returns count of all males with group by age, here 1 is represent it will increment by 1

db.students.aggregate([{ $match: { gender: "male" }},{ $group: { _id: "$age",  countOfStudents: { $sum: 1 }}}, { $sort: { countOfStudents: -1 }}]) 

db.students.aggregate([{ $match: { gender: "male" }},{ $group: { _id: "$age",  countOfStudents: { $sum: 1 }}}, { $sort: { countOfStudents: -1 }}, { $group: { _id: null, maxNumberInAge: { $max: "$numberOfStudents" }}}]) 

db.students.aggregate([{$group: { _id: "$age", sumOfAge: { $sum: { $toDouble: "$age" }}}}])


// unwind: deconstructs an array field from the input documents to output a document for each element. Each output document is the input document with the value of the array field replaced by the element.

db.students.aggregate([{ $unwind: "$Hobbies"}, { $group: { _id: "$age", hobbies: { $push: "$Hobbies" }}}]) 

// find average age of students

db.students.aggregate([{ $group: { _id: null, average: { $avg: "$age" }}}])

// find total number of hobbies of students

db.students.aggregate([{ $unwind: "$Hobbies" }, { $group: {_id: null, count: { $sum: 1 }}}])

db.students.aggregate([{ $group: {_id: null, count: { $sum: {$size: "$Hobbies" }}}}])


// bucket operator

// syntax
/**
{
  $bucket: {
      groupBy: <expression>,
      boundaries: [ <lowerbound1>, <lowerbound2>, ... ],
      default: <literal>,
      output: {
         <output1>: { <$accumulator expression> },
         ...
         <outputN>: { <$accumulator expression> }
      }
   }
}

 */


// find the total numbers and names of students which age is less than 20, greater than equal 20 and greater than equal to 25 by group of ages

db.students.aggregate([
   {
      $match: {
         gender: "male"
      }
   },
   {
      $bucket: {
         groupBy: "$age",
         boundaries: [0,20,25],
         default: "Group which is greater than 25",
         output: { 
            count: {
               $sum: 1
            },
            names: {
               $push: "$name"
            }

         }
      }
   }
])


