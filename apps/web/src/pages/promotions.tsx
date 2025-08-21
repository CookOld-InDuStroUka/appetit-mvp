import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Promotions() {
    return (
        <>
            <Header />
            <main style={{ maxWidth: 1200, margin: "20px auto", padding: "0 16px" }}>
                <h1>Акции</h1>
                <p>Здесь будут действующие акции и спецпредложения.</p>
            </main>
            <Footer />
        </>
    );
}
