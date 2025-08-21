import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Reviews() {
    return (
        <>
            <Header />
            <main style={{ maxWidth: 1200, margin: "20px auto", padding: "0 16px" }}>
                <h1>Отзывы</h1>
                <p>Здесь будут отзывы наших клиентов.</p>
            </main>
            <Footer />
        </>
    );
}
