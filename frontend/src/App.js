import React, { useState, useEffect } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import Login from './components/Login';
import JobsTable from './components/JobsTable';
import AddJob from './components/AddJob';
import EditJob from './components/EditJob';
import Filter from './components/Filter';
import toast, { Toaster } from 'react-hot-toast';
import './App.css';
import axios from 'axios';
// const baseURL = 'http://localhost:8080';
const baseURL = '';

const App = () => {
    const [user, setUser] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [showAddJob, setShowAddJob] = useState(false);
    const [showEditJob, setShowEditJob] = useState(false);
    const [jobToEdit, setJobToEdit] = useState(null);
    const [filter, setFilter] = useState({
        categoriesToShow: {
            result: {
                name: "Result",
                show: true
            },
            job_title: {
                name: "Job title",
                show: true
            },
            company: {
                name: "Company",
                show: true
            },
            job_description: {
                name: "Job description",
                show: true
            },
            salary: {
                name: "Salary",
                show: true
            },
            applied_date: {
                name: "Applied date",
                show: true
            },
            post_date: {
                name: "Post date",
                show: true
            },
            link: {
                name: "Link",
                show: true
            },
            notes: {
                name: "Notes",
                show: true
            }
        },
        resultsToShow: "all",
        searchQuery: ""
    });

    useEffect(() => {
        if (localStorage.getItem("auth_token") && localStorage.getItem("username")) {
            const token = localStorage.getItem("auth_token");
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            }
            axios
                .get(baseURL + '/jobs', config)
                .then((res) => {
                    const username = localStorage.getItem("username");
                    localStorage.setItem("jobs", JSON.stringify(res.data.jobs));
                    setUser(username);
                    setJobs(res.data.jobs);
                }).catch((err) => {
                    console.log(err)
                });
            setUser(localStorage.getItem("username"));
        }
    }, [])

    const handleCloseAddJob = () => {
        setShowAddJob(false);
    };
    const handleShowAddJob = () => setShowAddJob(true);

    const handleToggleEditJob = () => {
        setShowEditJob(!showEditJob);
    }

    const logout = () => {
        toast.dismiss();
        localStorage.clear();
        setUser(null);
        setJobs(null);
    }

    const deleteJob = (id) => {
        let confirm = window.confirm("Are you sure you want to delete this job?");
        if (!confirm) {
            return;
        }
        const token = localStorage.getItem("auth_token");
        const config = {
            headers: { Authorization: `Bearer ${token}` }
        }
        axios
            .delete(baseURL + '/jobs/' + id, config)
            .then((res) => {
                if (res.status === 200) {
                    toast.success("Job deleted");
                    let newJobs = jobs.filter(job => job.job_id !== res.data.job_id);
                    localStorage.setItem("jobs", JSON.stringify(newJobs));
                    setJobs(newJobs);
                }
            }).catch((err) => {
                console.log(err)
                toast.error("Failed to retrieve jobs. Please try again later...")
            })
    }

    const toggleFilter = () => {
        const oldClass = document.getElementById("filter").className;
        const newClass = oldClass === "hidden panel" ? "visible panel" : "hidden panel";
        document.getElementById("filter").className = newClass;
    }

    const queryFoundInJob = (query, job) => {
        let found = false;
        for (const [key, value] of Object.entries(job)) {
            if (!["result", "salary", "user_id", "job_id", "job_description"].includes(key)) {
                if (value.toLowerCase().includes(query.toLowerCase())) {
                    found = true;
                }
            }
        }
        return found;
    }

    let filteredJobs = filter.resultsToShow === "all" ? jobs : jobs.filter(job => job.result === filter.resultsToShow);
    filteredJobs = filter.searchQuery === "" ? filteredJobs : filteredJobs.filter(job => queryFoundInJob(filter.searchQuery, job));

    if (user && jobs) {
        return (
            <div className="main-logged-in">
                <Toaster />
                <Navbar bg="dark" variant="dark">
                    <Container>
                        <Navbar.Brand >Job Apps Tracker</Navbar.Brand>
                        <Nav className="me-auto">
                            <Nav.Link onClick={handleShowAddJob}>Add Job</Nav.Link>
                            <Nav.Link onClick={() => logout()}>Logout ({user})</Nav.Link>
                        </Nav>
                    </Container>
                </Navbar>
                <div>
                    <button className="accordion" onClick={toggleFilter}>Filter</button>
                    <div className="hidden panel" id="filter">
                        <Filter filter={filter} setFilter={setFilter} />
                    </div>
                    <JobsTable filter={filter} filteredJobs={filteredJobs} setShowEditJob={setShowEditJob} setJobToEdit={setJobToEdit} deleteJob={deleteJob} />
                </div>
                {
                    showAddJob &&
                    <AddJob handleClose={handleCloseAddJob} handleShow={handleShowAddJob} show={showAddJob} jobs={jobs} setJobs={setJobs} />
                }
                {
                    showEditJob &&
                    <EditJob handleClose={handleToggleEditJob} show={showEditJob} jobToEdit={jobToEdit} setJobToEdit={setJobToEdit} jobs={jobs} setJobs={setJobs} />
                }
            </div>
        )
    } else {
        return (
            <div className="main">
                <div className="login-div">
                    <Login setUser={setUser} setJobs={setJobs} />
                </div>
                <div className="version-div">
                    Version: {process.env.REACT_APP_VERSION}
                </div>
            </div>
        );
    }
}

export default App;
