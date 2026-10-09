
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

**Types of Joins** \

**`INNER JOIN`** returns only matching rows from both tables. \
**`LEFT JOIN`** returns all rows from left table and matched rows from right table. \
**`RIGHT JOIN`** returns all rows from right table and matched rows from left table. \
**`FULL OUTER JOIN`** returns all rows from both tables and matched rows where available. \
**`CROSS JOIN`** returns the cartesian product (each row of left table with every row of right table). 

[See for other reference](https://app.notion.com/p/What-are-SQL-Joins-3f410a608bf580d4b490ed6daaf8302c?source=copy_link)





