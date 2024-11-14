"use client"; // Mark as a client component

import { useState, useEffect, Fragment } from "react";
import Cookies from "js-cookie";
import SubmitTransaction from "../components/submitTransect";
import { Dialog, Transition } from "@headlessui/react";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

interface IResponse {
  key: string | number;
  value: string | number;
}

export default function Profile() {
  const [walletId, setWalletId] = useState<string>("");
  const [attributes, setAttributes] = useState<IResponse[]>([]);
  const [savedAttributes, setSavedAttributes] = useState<IResponse[]>([]);
  const [newKey, setNewKey] = useState<string>(""); 
  const [newValue, setNewValue] = useState<string>(""); 
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedAttributes, setSelectedAttributes] = useState<any[]>([]);

  // Predefined options for the "key" field
  const keyOptions = [
    "Name", 
    "Age", 
    "Email", 
    "Address", 
    "Phone", 
    "Hobbies", 
    "Favorite Food", 
    "Occupation", 
    "Country", 
    "City", 
    "Language", 
    "Skills", 
    "Education", 
    "Interests", 
    "Favorite Color", 
    "Birthday"
  ];

  const [filteredOptions, setFilteredOptions] = useState<string[]>(keyOptions);

  useEffect(() => {
    const savedWalletId = Cookies.get("walletAddress");
    if (savedWalletId) {
      setWalletId(savedWalletId);
    }

    const savedAttributes = Cookies.get("attributes");
    if (savedAttributes) {
      setAttributes(JSON.parse(savedAttributes));
    }

    const loadedSavedAttributes = Cookies.get("savedAttributes");
    if (loadedSavedAttributes) {
      setSavedAttributes(JSON.parse(loadedSavedAttributes));
    }
  }, []);

  const handleSaveAttribute = () => {
    if (newKey.trim() !== "" && newValue.trim() !== "") {
      const updatedAttributes = [
        ...attributes,
        { key: newKey, value: newValue },
      ];
      setAttributes(updatedAttributes);
      Cookies.set("attributes", JSON.stringify(updatedAttributes), {
        expires: 7,
      });
      setNewKey("");
      setNewValue("");
      setFilteredOptions(keyOptions); // Reset suggestions
    }
  };

  const handleDeleteAttribute = (index: any) => {
    const updatedAttributes = attributes.filter((_, i) => i !== index);
    setAttributes(updatedAttributes);
    Cookies.set("attributes", JSON.stringify(updatedAttributes), {
      expires: 7,
    });
  };

  const handleTransactionComplete = () => {
    // Retrieve any existing saved attributes from cookies, defaulting to an empty array if none are found
    const existingSavedAttributes: IResponse[] = Cookies.get("savedAttributes")
      ? JSON.parse(Cookies.get("savedAttributes") || "[]")
      : [];
  
    // Merge existing saved attributes with new ones, removing duplicates based on the key
    const updatedSavedAttributes = [...existingSavedAttributes, ...attributes].reduce((acc: IResponse[], current: IResponse) => {
      // Avoid duplicates based on the key
      if (!acc.find((item: IResponse) => item.key === current.key)) {
        acc.push(current);
      }
      return acc;
    }, [] as IResponse[]); // Type assertion to define acc as IResponse[]
  
    // Save the merged attributes to cookies and update the state
    setSavedAttributes(updatedSavedAttributes);
    Cookies.set("savedAttributes", JSON.stringify(updatedSavedAttributes), { expires: 7 });
  
    // Clear the attributes after saving
    setAttributes([]);
    Cookies.remove("attributes");
  };
  
  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      handleSaveAttribute();
    }
  };

  const jsonData = {
    name: "Test Data",
    timestamp: new Date().toISOString(),
  };

  const generateQRCodeData = () => {
    const selectedData = selectedAttributes.reduce(
      (acc: any, attribute: any) => {
        acc[attribute.key] = attribute.value;
        return acc;
      },
      {} as Record<string, string>
    );
    return JSON.stringify(selectedData);
  };

  const handleToggleAttribute = (attribute: any) => {
    setSelectedAttributes((prev: any) =>
      prev.includes(attribute)
        ? prev.filter((attr: any) => attr !== attribute)
        : [...prev, attribute]
    );
  };

  const handleKeyChange = (e: any) => {
    const value = e.target.value;
    setNewKey(value);

    // Filter options based on the input value
    setFilteredOptions(
      keyOptions.filter(option =>
        option.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  const isConnected = true;

  return (
    <div className="flex flex-col lg:flex-row p-8 pb-20 gap-16 sm:p-18 mx-auto max-w-7xl">
      {/* Right Section: Wallet */}
      <div className="lg:sticky lg:top-0 lg:w-1/3">
        <div className="bg-white/60 sm:mx-8 lg:mx-0 rounded-3xl p-8 ring-1 ring-gray-900/10 sm:p-10">
          <h3 className="text-indigo-600 text-base/7 font-semibold">Wallet</h3>
          <p className="mt-4 flex items-baseline gap-x-2">
            <span className="text-gray-900 text-sm font-semibold tracking-tight">
              {walletId ? walletId : "Wallet ID"}
            </span>
          </p>
          <p className="text-gray-600 mt-6 text-base/7">description</p>

          <SubmitTransaction
            jsonData={jsonData}
            isConnected={isConnected}
            onTransactionComplete={handleTransactionComplete}
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300 focus-visible:outline-indigo-600 w-full mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-10"
          >
            Generate QR Code
          </button>
        </div>
      </div>

      {/* Left Section */}
      <div className="flex-1">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700">Add Attribute:</h2>
          <div className="mt-4 mb-4 flex items-center gap-2">
            {/* Replace input with select for key options */}
            <input
              type="text"
              value={newKey}
              onChange={handleKeyChange}
              placeholder="Key"
              onKeyDown={handleKeyDown}
              className="border rounded-md p-4 w-1/2"
              list="keyOptionsList"
            />
            <datalist id="keyOptionsList">
              {filteredOptions.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Value"
              onKeyDown={handleKeyDown}
              className="border rounded-md p-4 w-1/2"
            />
            <button
              onClick={handleSaveAttribute}
              className="bg-indigo-600 text-white rounded-md px-4 py-4 font-semibold"
            >
              Add
            </button>
          </div>
        </div>

        {/* Attributes Section */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
            Attributes
          </h2>
          <div className="space-y-3">
            {attributes.length > 0 ? (
              attributes.map((attribute, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-4 rounded-md shadow-sm border border-gray-200"
                >
                  <div className="flex items-center gap-2">
                    <strong className="text-gray-800">{attribute.key}:</strong>
                    <span className="text-gray-600">{attribute.value}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteAttribute(index)}
                    className="text-red-500 hover:text-red-700 text-sm font-semibold"
                  >
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No attributes added yet.</p>
            )}
          </div>
        </div>

        {/* Saved Attributes Section */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
            Saved Attributes
          </h2>
          <div className="space-y-3">
            {savedAttributes.length > 0 ? (
              savedAttributes.map((attribute, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-4 rounded-md shadow-sm border border-gray-200"
                >
                  <strong className="text-gray-800">{attribute.key}:</strong>
                  <span className="text-gray-600 ml-2">{attribute.value}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No saved attributes.</p>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsModalOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">Generate QR Code</Dialog.Title>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Select attributes to include in the QR code:</p>
                    <div className="mt-4 space-y-2">
                      {savedAttributes.map((attribute) => (
                        <div key={attribute.key} className="flex items-center">
                          <input type="checkbox" checked={selectedAttributes.includes(attribute)} onChange={() => handleToggleAttribute(attribute)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                          <label className="ml-2 text-gray-700">{attribute.key}: {attribute.value}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between">
                    <button type="button" className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700" onClick={() => setIsModalOpen(false)}>Close</button>
                    <button type="button" className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700" onClick={() => setIsModalOpen(false)}>Generate</button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}