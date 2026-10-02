## PostgreSQL Notes


### Basic Commands
___

**To connect database**

```
\connect [database]
```

**To get all columns of table**

```
\d [table_name]
```

### Basic Queries
___

**To get all records of table employee without explicitly type any column**

```
-- Syntax:  SELECT * FROM [table_name];

-- Example:
SELECT * FROM employees;
```

**To get records by selecting columns first name, email from employees**

```
-- Syntax:  SELECT * [column1, column2] FROM [table_name];

-- Example:
SELECT first_name, email FROM employees;
```

**To get all distinct first name of employee table**

```
-- Syntax:  SELECT DISTINCT [column1, column2] FROM [table_name];

-- Example:
SELECT DISTINCT first_name FROM employees;
```

**To get all employees's first name, phone and email whose from Delhi**

```
-- Syntax:  SELECT [column1, column2] FROM [table_name] WHERE [column] {condition};

-- Example:
SELECT first_name, email FROM employees WHERE city = 'Delhi';
```

**To get records by selecting columns first name, email from employees whose salaries less than 60000**

```
-- Example:
SELECT first_name, email FROM employees WHERE employee_id IN (SELECT employee_id FROM salaries WHERE salary < 60000);
```


**To get salaries in acsending (default) order**

```
-- Syntax:  SELECT [column] FROM [table_name] ORDER BY [column];

-- Example:
SELECT salary FROM salaries ORDER BY salary;
```


**To get sorted salaries in descending order**

```
-- Syntax:  SELECT [column] FROM [table_name] ORDER BY [column] DESC;

-- Example:
SELECT salary FROM salaries ORDER BY salary DESC;
```

**To get salaries within order by multiple column**

```
-- Example:
SELECT salary FROM salaries ORDER BY salary_id, salary;
```

**To get first name and city by ascending order first name and descending order city**

```
-- Syntax:  SELECT [column1, column2] FROM [table_name] ORDER BY [column1] ASC, [column2] DESC;

-- Example:
SELECT first_name, city FROM employees ORDER BY first_name ASC, city DESC; 

```


**To get records of whose from city Delhi and their first name starts with "A"**

```
-- Syntax:  SELECT [column] FROM [table_name] WHERE {condition_expression_1} AND {condition_expression_2};

-- Example:
SELECT first_name FROM employees WHERE city = 'Delhi' AND first_name LIKE 'A%';

SELECT first_name FROM employees WHERE city = 'Delhi' AND (first_name LIKE 'D%' OR first_name LIKE 'A%');
```


**To get records of whose from city Delhi and either their first name starts with "A" or "D"**

```
-- Syntax:  SELECT [column] FROM [table_name] WHERE {condition_expression_1} AND {condition_expression_2} OR {condition_expression_3};

-- Example:
SELECT first_name FROM employees WHERE city = 'Delhi' AND (first_name LIKE 'D%' OR first_name LIKE 'A%');
```


**To get records of employees whose not works in departments "Sales" and "Human Resources"**

```
-- Example 1: (Way 1)
SELECT first_name, email FROM employees WHERE department_id NOT IN (SELECT department_id FROM departments WHERE department_name IN ('Sales', 'Human Resources'));

-- Example 2: (Way 2)
SELECT first_name, email FROM employees e WHERE NOT EXISTS (SELECT 1 FROM departments d WHERE d.department_id = e.department_id AND d.department_name IN ('Sales', 'Human Resources'));
```