import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function DeliveryPayment() {
    return (
        <>
            <Header />
            <main style={{ maxWidth: 1200, margin: "20px auto", padding: "0 16px" }}>
                <h1>Доставка и оплата</h1>
                <p>Информация о способах доставки и вариантах оплаты появится здесь.</p>
            </main>
            <Footer />
        </>
    );
}
