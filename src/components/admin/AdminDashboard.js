import React, { useState, useEffect } from "react";
import { Dropdown, Card, Image, Button, Modal, Form } from "react-bootstrap";
import axios from "axios";

export default function AdminDashboard() {
  const [foods, setFoods] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);

  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [showEditFoodModal, setShowEditFoodModal] = useState(false);

  const [newFood, setNewFood] = useState({
    name: "",
    price: 0,
    image: "",
    options: [],
    category: "",
  });
  const [newOption, setNewOption] = useState({ name: "", price: 0 });

  const [editedFood, setEditedFood] = useState({});
  const [editedOptions, setEditedOptions] = useState([]);

  useEffect(() => {
    fetchFoods();
  }, []);
  const handleDeleteFood = async (foodId) => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) {
        throw new Error("Admin token not found");
      }

      const response = await axios.delete(
        `http://localhost:5000/foods/${foodId}/delete`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );
      console.log(response);
      fetchFoods();
    } catch (error) {
      console.error("Error deleting food:", error);
    }
  };
  const fetchFoods = async () => {
    try {
      const response = await axios.get("http://localhost:5000/foods");
      setFoods(response.data);
    } catch (error) {
      console.error("Error fetching foods:", error);
    }
  };
  const handleSetInStock = async (foodId) => {
    try {
      const response = await axios.patch(
        `http://localhost:5000/foods/${foodId}/set-instock`,
        {},
        {}
      );
      console.log("Food set as in stock successfully");
      console.log(response);
      fetchFoods(); // Update the list of foods after setting the stock status
    } catch (error) {
      console.error("Error setting food as in stock:", error);
    }
  };

  const handleSetOutOfStock = async (foodId) => {
    try {
      const response = await axios.patch(
        `http://localhost:5000/foods/${foodId}/set-outofstock`,
        {},
        {}
      );
      console.log("Food set as out of stock successfully");
      console.log(response);
      fetchFoods(); // Update the list of foods after setting the stock status
    } catch (error) {
      console.error("Error setting food as out of stock:", error);
    }
  };

  
  const handleOptionSelect = (foodId, option) => {
    const selectedFood = foods.find((food) => food._id === foodId);
    if (!selectedFood) return;

    const selectedOption = selectedFood.options.find(
      (opt) => opt._id === option._id
    );
    if (!selectedOption) return;

    setSelectedOptions((prevOptions) => {
      const updatedOptions = [...prevOptions];
      const existingOptionIndex = updatedOptions.findIndex(
        (opt) => opt._id === option._id
      );
      if (existingOptionIndex !== -1) {
        updatedOptions[existingOptionIndex] = {
          ...updatedOptions[existingOptionIndex],
          price: selectedOption.price,
        };
      }
      return updatedOptions;
    });
  };

  const handleShowAddFoodModal = () => {
    setShowAddFoodModal(true);
  };

  const handleCloseAddFoodModal = () => {
    setShowAddFoodModal(false);
  };

  const handleAddOption = () => {
    setNewFood((prevState) => ({
      ...prevState,
      options: [
        ...prevState.options,
        { name: newOption.name, price: newOption.price },
      ],
    }));
    setNewOption({ name: "", price: 0 });
  };

  const handleAddFood = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) {
        throw new Error("Admin token not found");
      }

      const response = await axios.post(
        "http://localhost:5000/foods/add",
        newFood,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );
      console.log(response);
      setShowAddFoodModal(false);
      setNewFood({ name: "", price: 0, image: "", options: [], category: "" });
      fetchFoods();
    } catch (error) {
      console.error("Error adding food:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFood((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleOptionChange = (e) => {
    const { name, value } = e.target;
    setNewOption((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleEditFood = (food) => {
    setEditedFood(food);
    setEditedOptions([...food.options]);
    setShowEditFoodModal(true);
  };

  const handleCloseEditFoodModal = () => {
    setShowEditFoodModal(false);
  };

  const handleEditOptionChange = (index, e) => {
    const { name, value } = e.target;
    setEditedOptions((prevOptions) => {
      const updatedOptions = [...prevOptions];
      updatedOptions[index] = { ...updatedOptions[index], [name]: value };
      return updatedOptions;
    });
  };

  const handleAddEditedOption = () => {
    setEditedOptions((prevOptions) => [...prevOptions, { name: "", price: 0 }]);
  };

  const handleRemoveEditedOption = (index) => {
    setEditedOptions((prevOptions) =>
      prevOptions.filter((_, i) => i !== index)
    );
  };

  const handleEditFoodSubmit = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) {
        throw new Error("Admin token not found");
      }

      const editedFoodWithUpdatedOptions = {
        ...editedFood,
        options: editedOptions,
      };

      const response = await axios.put(
        `http://localhost:5000/foods/${editedFood._id}/update`,
        editedFoodWithUpdatedOptions,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );
      console.log(response);
      setShowEditFoodModal(false);
      fetchFoods();
    } catch (error) {
      console.error("Error editing food:", error);
    }
  };

  return (
    <div className="container mt-5">
    <h2 className="mb-4">Admin Dashboard</h2>
    <Button variant="primary" onClick={() => setShowAddFoodModal(true)}>
      Add Food
    </Button>

    {/* Food Cards */}
    <div className="row mt-4">
      {foods.map((food) => (
        <div key={food._id} className="col-md-4 mb-4">
          <Card>
            <div className="card-image">
              <Image
                src={food.image}
                className="card-img-top"
                alt={food.name}
                style={{ height: "250px", objectFit: "cover" }}
              />
            </div>
            <Card.Body>
              <Card.Title>{food.name}</Card.Title>
              <Card.Text>
                Price: $
                {selectedOptions.find((opt) => opt._id === food._id)?.price ||
                  food.price}
              </Card.Text>
              {/* Other card content */}
              <Button
                variant="success"
                onClick={() => handleSetInStock(food._id)}
                className="mr-2" style={{"background":"none",color:"black"}}
              >
                Set In Stock
              </Button><br/><br/>
              <Button
                variant="danger"
                onClick={() => handleSetOutOfStock(food._id)} style={{"background":"none",color:"black"}}
              >
                Set Out of Stock
              </Button><br/><br/>
              <Dropdown className="mt-2">
                <Dropdown.Toggle variant="primary" id="dropdown-basic">
                  Options
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {food.options.map((option) => (
                    <Dropdown.Item
                      key={option._id}
                      onClick={() => handleOptionSelect(food._id, option)}
                    >
                      {option.name} - ${option.price}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown><br/><br/>
              <div className="mt-2">
                <Button
                  variant="primary"
                  onClick={() => handleEditFood(food)}
                  className="mr-2"style={{"background":"none",color:"black"}}
                >
                  Edit
                </Button><br/><br/>
                <Button
                  variant="danger"
                  onClick={() => handleDeleteFood(food._id)} style={{"background":"none",color:"black"}}
                >
                  Delete
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      ))}
    </div>


      {/* Add Food Modal */}
      <Modal show={showAddFoodModal} onHide={handleCloseAddFoodModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Food</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="foodName">
              <Form.Label>Food Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter food name"
                name="name"
                value={newFood.name}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="foodPrice">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter price"
                name="price"
                value={newFood.price}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="foodImage">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter image URL"
                name="image"
                value={newFood.image}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="food">
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Category"
                name="category"
                value={newFood.category}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="foodOptions">
              <Form.Label>Options</Form.Label>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Form.Control
                  type="text"
                  placeholder="Option name"
                  name="name"
                  value={newOption.name}
                  onChange={handleOptionChange}
                />
                <Form.Control
                  type="number"
                  placeholder="Option price"
                  name="price"
                  value={newOption.price}
                  onChange={handleOptionChange}
                />
                <Button variant="primary" onClick={handleAddOption}>
                  Add Option
                </Button>
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddFoodModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddFood}>
            Add Food
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Food Modal */}
      <Modal show={showEditFoodModal} onHide={handleCloseEditFoodModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Food</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="editFoodName">
              <Form.Label>Food Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter food name"
                name="name"
                value={editedFood.name}
                onChange={(e) =>
                  setEditedFood({ ...editedFood, name: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group controlId="editFoodPrice">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter price"
                name="price"
                value={editedFood.price}
                onChange={(e) =>
                  setEditedFood({ ...editedFood, price: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group controlId="editFood">
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Category"
                name="category"
                value={editedFood.category}
                onChange={(e) =>
                  setEditedFood({ ...editedFood, category: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group controlId="editFoodImage">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter image URL"
                name="image"
                value={editedFood.image}
                onChange={(e) =>
                  setEditedFood({ ...editedFood, image: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group controlId="editFoodOptions">
              <Form.Label>Options</Form.Label>
              {editedOptions.map((option, index) => (
                <div key={index}>
                  <Form.Group controlId={`editOptionName${index}`}>
                    <Form.Label>Option Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter option name"
                      name="name"
                      value={option.name}
                      onChange={(e) => handleEditOptionChange(index, e)}
                    />
                  </Form.Group>
                  <Form.Group controlId={`editOptionPrice${index}`}>
                    <Form.Label>Option Price</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Enter option price"
                      name="price"
                      value={option.price}
                      onChange={(e) => handleEditOptionChange(index, e)}
                    />
                  </Form.Group>
                  <Button
                    variant="danger"
                    onClick={() => handleRemoveEditedOption(index)}
                  >
                    Remove Option
                  </Button>
                </div>
              ))}
              <Button variant="primary" onClick={handleAddEditedOption}>
                Add Option
              </Button>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditFoodModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditFoodSubmit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
