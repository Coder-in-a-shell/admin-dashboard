import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [editingRows, setEditingRows] = useState({});

  const editRow = (id) => {
    setEditingRows((prevEditing) => ({
      ...prevEditing,
      [id]: { ...prevEditing[id], isEditing: true },
    }));
  };

  const saveEditedRow = (id) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === id
          ? { ...user, isEditing: false } // Turn off editing mode
          : user
      )
    );

    setEditingRows((prevEditing) => ({
      ...prevEditing,
      [id]: { ...prevEditing[id], isEditing: false },
    }));
  };
  useEffect(() => {
    fetch(
      "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
    )
      .then((response) => response.json())
      .then((data) => setUsers(data));
  }, []);

  const filteredUsers = users.filter((user) =>
    Object.values(user).some((value) =>
      value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const startIndex = (currentPage - 1) * 10;
  const endIndex = startIndex + 10;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handlePagination = (destination) => {
    const totalPages = Math.ceil(filteredUsers.length / 10);

    switch (destination) {
      case "first":
        setCurrentPage(1);
        break;
      case "prev":
        setCurrentPage(Math.max(currentPage - 1, 1));
        break;
      case "next":
        setCurrentPage(Math.min(currentPage + 1, totalPages));
        break;
      case "last":
        setCurrentPage(totalPages);
        break;
      default:
        break;
    }
  };

  const toggleRowSelection = (id) => {
    setSelectedRows((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((selectedId) => selectedId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  const deleteSelected = () => {
    setUsers((prevUsers) => {
      const updatedUsers = prevUsers.filter(
        (user) => !selectedRows.includes(user.id)
      );
      setSelectedRows([]);
      return updatedUsers;
    });
  };
  const deleteRow = (id) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
  };

  return (
    <div className="App">
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <table>
        <thead>
          <tr>
            <th></th>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user) => (
            <tr
              key={user.id}
              className={selectedRows.includes(user.id) ? "selected" : ""}
            >
              <td>
                <input
                  type="checkbox"
                  onChange={() => toggleRowSelection(user.id)}
                  checked={selectedRows.includes(user.id)}
                />
              </td>
              <td>{user.id}</td>
              <td>
                {editingRows[user.id] && editingRows[user.id].isEditing ? (
                  <input
                    type="text"
                    value={user.name}
                    onChange={(e) =>
                      setUsers((prevUsers) =>
                        prevUsers.map((u) =>
                          u.id === user.id ? { ...u, name: e.target.value } : u
                        )
                      )
                    }
                  />
                ) : (
                  user.name
                )}
              </td>

              <td>
                {editingRows[user.id] && editingRows[user.id].isEditing ? (
                  <input
                    type="text"
                    value={user.email}
                    onChange={(e) =>
                      setUsers((prevUsers) =>
                        prevUsers.map((u) =>
                          u.id === user.id ? { ...u, email: e.target.value } : u
                        )
                      )
                    }
                  />
                ) : (
                  user.email
                )}
              </td>
              <td>
                {editingRows[user.id] && editingRows[user.id].isEditing ? (
                  <input
                    type="text"
                    value={user.role}
                    onChange={(e) =>
                      setUsers((prevUsers) =>
                        prevUsers.map((u) =>
                          u.id === user.id ? { ...u, role: e.target.value } : u
                        )
                      )
                    }
                  />
                ) : (
                  user.role
                )}
              </td>
              <td>
                {editingRows[user.id] && editingRows[user.id].isEditing ? (
                  <>
                    <button
                      className="edit"
                      onClick={() => saveEditedRow(user.id)}
                    >
                      Save
                    </button>
                    <button
                      className="delete"
                      onClick={() =>
                        setEditingRows((prevEditing) => ({
                          ...prevEditing,
                          [user.id]: {
                            ...prevEditing[user.id],
                            isEditing: false,
                          },
                        }))
                      }
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button className="edit" onClick={() => editRow(user.id)}>
                    Edit
                  </button>
                )}
                <button className="delete" onClick={() => deleteRow(user.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button onClick={() => handlePagination("first")}>First</button>
        <button onClick={() => handlePagination("prev")}>Previous</button>
        <span>{`Page ${currentPage} of ${Math.ceil(
          filteredUsers.length / 10
        )}`}</span>
        <button onClick={() => handlePagination("next")}>Next</button>
        <button onClick={() => handlePagination("last")}>Last</button>
      </div>

      <button onClick={deleteSelected}>Delete Selected</button>
    </div>
  );
}

export default App;
