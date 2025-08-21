import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Addresses() {
    return (
        <>
            <Header />
            <main style={{ maxWidth: 1200, margin: "20px auto", padding: "0 16px" }}>
                <h1>Адреса</h1>
                <p>Здесь будет список адресов наших ресторанов.</p>
            </main>
            <Footer />
        </>
    );
}
