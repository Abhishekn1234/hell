import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Modal, Form, Container, Row, Col } from 'react-bootstrap';

const FoodList = () => {
  const [categories, setCategories] = useState([]);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ category: '', description: '' });
  const [foods, setFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [showFoodDetailsModal, setShowFoodDetailsModal] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchFoods();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/category');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchFoods = async () => {
    try {
      const response = await axios.get('http://localhost:5000/foods');
      setFoods(response.data);
    } catch (error) {
      console.error('Error fetching foods:', error);
    }
  };

  const handleViewDetails = (food) => {
    setSelectedFood(food);
    setShowFoodDetailsModal(true);
  };

  const handleCloseFoodDetailsModal = () => {
    setShowFoodDetailsModal(false);
  };

  const handleAddCategory = async () => {
    try {
      const response = await axios.post('http://localhost:5000/category', newCategory);
      console.log('New category added:', response.data);
      fetchCategories();
      setShowAddCategoryModal(false);
      setNewCategory({ category: '', description: '' });
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleCategoryChange = (e) => {
    const { name, value } = e.target;
    setNewCategory(prevState => ({ ...prevState, [name]: value }));
  };

  const handleShowAddCategoryModal = () => {
    setShowAddCategoryModal(true);
  };

  const handleCloseAddCategoryModal = () => {
    setShowAddCategoryModal(false);
  };

  return (
    <Container>
      <h1 className="mt-4">Food List</h1>
      <div className="mt-4">
        <h2>Categories</h2>
        <div className="d-flex flex-wrap">
          {categories.map(category => (
            <div key={category._id} className="me-3 mb-3">
              <Card style={{ width: '18rem' }}>
                <Card.Body>
                  <Card.Title>{category.category}</Card.Title>
                  <Card.Text>{category.description}</Card.Text>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
        <Button onClick={handleShowAddCategoryModal} className="mt-3">Add Category</Button>
        {/* Add Category Modal */}
        <Modal show={showAddCategoryModal} onHide={handleCloseAddCategoryModal}>
          <Modal.Header closeButton>
            <Modal.Title>Add Category</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="category">
                <Form.Label>Category</Form.Label>
                <Form.Control type="text" name="category" value={newCategory.category} onChange={handleCategoryChange} />
              </Form.Group>
              <Form.Group controlId="description">
                <Form.Label>Description</Form.Label>
                <Form.Control type="text" name="description" value={newCategory.description} onChange={handleCategoryChange} />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseAddCategoryModal}>Cancel</Button>
            <Button variant="primary" onClick={handleAddCategory}>Add</Button>
          </Modal.Footer>
        </Modal>
      </div>
      <h2 className="mt-4">Foods</h2>
      <Row xs={1} md={3} className="g-4">
        {foods.map(food => (
          <Col key={food._id}>
            <Card className="h-100" style={{ width: '18rem' }}>
              <Card.Img variant="top" src={food.image} className="card-img-top" style={{ objectFit: 'cover', height: '200px' }} />
              <Card.Body>
                <Card.Title>{food.name}</Card.Title>
                <Card.Text>Price: ${food.price}</Card.Text>
                <Button variant="primary" onClick={() => handleViewDetails(food)}>View Details</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      {/* Food Details Modal */}
      <Modal show={showFoodDetailsModal} onHide={handleCloseFoodDetailsModal}>
        <Modal.Header closeButton>
          <Modal.Title>Food Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>{selectedFood && selectedFood.name}</h4>
          <p>Price: ${selectedFood && selectedFood.price}</p>
          {/* Additional details can be added here */}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseFoodDetailsModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default FoodList;
