// update nested array with using $pop, $pull, $addToSet operators
// Note: here we are taking an example of student collection

db.students.updatedMany({ experience: { $eleMatch:{ duration: { $lte: 1 }}}}, { $set: { "experience.$[].neglect": 1}})


// for all matched

db.students.updateMany({ experience:{ $eleMatch:{ duration: { $lte: 1 }}}}, { $set: { "experience.$[e].neglect": true }}, { arrayFilters: [{ "e.duration": { $lte: 1 }}]})


// to add new documents into nested array

db.students.updateOne({ name: "Rohit" }, { $push: { experience: { company: "XYZ", duration: 3 }}})

// delete last element from array (experience array) of documents

db.students.updateOne({ name: "Rohit" }, { $pop: { experience: 1  }})

// delete by filter

db.students.updateOne({ name: "Rohit" }, { $pull: { experience: { company: "Amazon", duration: 4 }}})


// text indexing 

db.students.createIndex({ name: "text" }) // creating index with single field

db.students.createIndex({name:"text", bio:"text"}) // creating index with multiple field

db.students.find({ $text: { $search: "youtube actor" }}, { scores: { $meta: "textScore" }}) // find with meta data

// to set priority for search queries

db.students.createIndex({ name: "text", bio: "text"}, { weights: { name: 999, bio: 90}})

// to find and sort

db.students.find({ $text: { $search: "actor sita" }}, { scrores: { $meta: "textScore" }}).sort({ scores: { $meta: "textScore" }})

// to running create index in background without block entire collection

db.students.createIndex({ name: "text", bio:"text" }, { background: true })

