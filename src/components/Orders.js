import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";
import axios from "axios";
import {Link} from "react-router-dom"
export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("razorpay"); // Default payment method
  const loadScript = (src, callback) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      if (callback) callback();
    };
    document.body.appendChild(script);
  };
  useEffect(() => {
    // Load Razorpay script dynamically when the component mounts
    loadScript("https://checkout.razorpay.com/v1/checkout.js", () => {
      console.log("Razorpay script loaded");
    });
  }, []);

  const fetchOrders = async () => {
    try {
      const userEmail = localStorage.getItem("userEmail");
      const userName = localStorage.getItem("Name");

      if (!userEmail || !userName) {
        console.error("User email or name not found in localStorage");
        return;
      }

      const response = await axios.get("http://localhost:5000/orders", {
        headers: {
          userEmail,
          userName,
        },
      });

      const userOrders = response.data.filter(
        (order) => order.email === userEmail && order.Name === userName
      );
      const totalPrice = userOrders.reduce(
        (acc, order) => acc + totalOrderPrice(order.cartItems),
        0
      );

      setOrders(userOrders);
      setTotalPrice(totalPrice);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const totalOrderPrice = (cartItems) => {
    return cartItems.reduce((acc, item) => {
      const itemPrice = item.option ? item.option.price : item.price;
      return acc + itemPrice * item.quantity;
    }, 0);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await axios.delete(`http://localhost:5000/orders/${orderId}`);
      const updatedOrders = orders.filter((order) => order._id !== orderId);
      const totalPriceAfterDelete = updatedOrders.reduce(
        (acc, order) => acc + totalOrderPrice(order.cartItems),
        0
      );

      setOrders(updatedOrders);
      setTotalPrice(totalPriceAfterDelete);

      alert("Order deleted successfully!");
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Failed to delete order. Please try again later.");
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      const userEmail = localStorage.getItem("userEmail");
      const userName = localStorage.getItem("Name");

      // Make a POST request to your backend endpoint to initiate Razorpay payment
      const response = await axios.post("http://localhost:5000/payment/razorpay", {
        amount: totalPrice * 100, // Amount in paisa (multiply by 100 to convert to paisa)
        currency: "INR",
        userEmail,
        userName,
        cartItems: orders.length > 0 ? orders[0].cartItems : [], // Assuming cartItems is an array of items
      });

      // Handle the response from the backend
      if (response.status === 200) {
        const { orderId, razorpayDetails } = response.data;

        // Redirect the user to the Razorpay checkout page
        const options = {
          key: "rzp_live_dDHVgHh9Ks59E7", // Replace with your Razorpay key ID
          amount: totalPrice * 100, // Amount in paisa (multiply by 100 to convert to paisa)
          currency: "INR",
          order_id: orderId,
          handler: function (response) {
            // Handle payment success
            alert("Payment successful!");
            console.log(response);
            console.log(razorpayDetails);
          },
          prefill: {
            email: userEmail,
          },
          theme: {
            color: "#F37254",
          },
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.open();
      } else {
        console.error("Unexpected response:", response);
        alert("Payment failed. Unexpected response from the server.");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Payment failed. Please try again later.");
    }
  };

  return (
    <div>
      <h1>Orders</h1>
      {orders.length > 0 ? (
        <>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Product Name</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>
                    {order.cartItems.map((item) => (
                      <div key={item._id}>{item.name}</div>
                    ))}
                  </td>
                  <td>
                    {order.cartItems.map((item) => (
                      <div key={item._id}>
                        $
                        {item.option
                          ? item.option.price * item.quantity
                          : item.price * item.quantity}
                      </div>
                    ))}
                  </td>
                  <td>
                    {order.cartItems.map((item) => (
                      <div key={item._id}>{item.quantity}</div>
                    ))}
                  </td>
                  <td>${totalOrderPrice(order.cartItems)}</td>
                  <td>
                    <Button
                      variant="info"
                      onClick={() => handleViewDetails(order)}
                    >
                      View Details
                    </Button>{" "}
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteOrder(order._id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <h2>Total Price of All Orders: ${totalPrice}</h2>
          <Button variant="success" onClick={() => setShowPaymentModal(true)}>
            Make Payment
          </Button>
        </>
      ) : (
        <p>No orders placed yet.</p>
      )}

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>Order ID:</strong> {selectedOrder && selectedOrder._id}
          </p>
          <p>
            <strong>Product Name:</strong>{" "}
            {selectedOrder && selectedOrder.cartItems[0].name}
          </p>
          <p>
            <strong>Price:</strong> $
            {selectedOrder && totalOrderPrice(selectedOrder.cartItems)}
          </p>
          <p>
            <strong>Quantity:</strong>{" "}
            {selectedOrder &&
              selectedOrder.cartItems.reduce(
                (total, item) => total + item.quantity,
                0
              )}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Make Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="paymentMethod">
              <Form.Label>Select Payment Method</Form.Label>
              <Form.Control
                as="select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="razorpay">Razorpay</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowPaymentModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handlePaymentSuccess}>
            Pay ${totalPrice}
          </Button>
        </Modal.Footer>
      </Modal>
      

    </div>
  );
}
