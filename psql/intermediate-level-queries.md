
### Aggregate functions

Aggregate functions perform calculations on a set of values and return a single result.

---

**`COUNT`** used to get count of records or rows. \
**`SUM`** returns the total sum of numeric values. \
**`AVG`** returns the average of numeric values. \
**`MIN`** returns the smallest numeric values in records. \
**`MAX`** returns the largest numeric values in records. 


**To get total number of email which starts with "a"**

```
SELECT COUNT(email) FROM employees WHERE email LIKE 'a%';
```

**To get sum of distinct salaries of all employees**

```
SELECT DISTINCT SUM(salary) FROM salaries;
```

**To get average of distinct salaries of all employees**

```
SELECT DISTINCT AVG(salary) FROM salaries;
```

**To get minimum and maximum salary of employees**

```
SELECT DISTINCT MIN(salary), MAX(salary) FROM salaries;
```

---

**`GROUP BY`** It groups rows based on one or more columns and is usually used with aggregate functions. \
**`HAVING`** Filter the groups formed by `GROUP BY`. It works on aggregate values and cannot be used without `GROUP BY`.

**To get employee's duplicate first name** 

```
SELECT first_name, COUNT(*) AS Occurences FROM employees GROUP BY first_name HAVING COUNT(*) > 1;
```

**To get average salary of each department's employees**

```
SELECT d.department_name AS Department, AVG(s.salary) AS AverageSalary FROM departments d JOIN employees e ON e.department_id = d.department_id JOIN salaries s ON s.employee_id = e.employee_id GROUP BY department_name ORDER BY AverageSalary DESC;
```

**To get count of employees working in each department**

```
SELECT COUNT(*) AS EmpCount, department_name FROM departments d JOIN employees e ON e.department_id = d.department_id GROUP BY department_name ORDER BY EmpCount DESC;
```

**To get total payoff for each departments**

```
SELECT department_name, SUM(salary) AS TotalSalary FROM departments d JOIN employees e ON e.department_id = d.department_id JOIN salaries s ON e.employee_id = s.employee_id GROUP BY department_name;
```


---

**`JOIN`** are used to combine rows from two or more tables based on related column between them. \

**Types of Joins** 

**`INNER JOIN`** returns only matching rows from both tables. \
**`LEFT JOIN`** returns all rows from left table and matched rows from right table. \
**`RIGHT JOIN`** returns all rows from right table and matched rows from left table. \
**`FULL OUTER JOIN`** returns all rows from both tables and matched rows where available. \
**`CROSS JOIN`** returns the cartesian product (each row of left table with every row of right table). \
**`SELF JOIN`** is a regular join where a table is joined with itself. 

[See for other reference](https://app.notion.com/p/What-are-SQL-Joins-3f410a608bf580d4b490ed6daaf8302c?source=copy_link)


**To get department name from employees with join department table**

```
SELECT department_name FROM employees INNER JOIN departments ON employees.department_id = departments.department_id;
```

**To get department names by combining employees and departments using CROSS JOIN**

```
SELECT department_name FROM employees CROSS JOIN departments LIMIT 5;
```

**To get first name of employee and first name of manager from same employee table** (example of SELF JOIN)

```
SELECT e.first_name AS Employee, m.first_name AS Manager FROM employees e LEFT JOIN employees m ON m.employee_id = e.manager_id LIMIT 20;
```

---

### Set operators

**`UNION`** returns unique rows from both queries. Duplicates removed. 
**`UNION ALL`** Returns all rows from both queries duplicates included. 
**`INTERSECT`** Returns only common records. 
**`EXCEPT / MINUS`** Returns records from A that are not in B. 


**To get records rows from both tables except duplicates**

```
SELECT first_name FROM employees UNION SELECT first_name FROM employees;
```

**To get all records from both tables with duplication**


```
-- The employees table contains both employees and managers, and is used to retrieve their first names.
SELECT first_name FROM employees UNION ALL SELECT first_name FROM employees;
```

**Common records**

```
SELECT first_name FROM employees INTERSECT SELECT first_name FROM employees;
```

**To get common employees record whose are manager as well**

```
SELECT employee_id FROM employees EXCEPT SELECT manager_id FROM employees;
```