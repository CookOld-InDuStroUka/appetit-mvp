import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Careers() {
    return (
        <>
            <Header />
            <main style={{ maxWidth: 1200, margin: "20px auto", padding: "0 16px" }}>
                <h1>Карьера</h1>
                <p>Информация о текущих вакансиях будет опубликована здесь.</p>
            </main>
            <Footer />
        </>
    );
}
