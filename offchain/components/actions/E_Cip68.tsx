import { useEffect, useState } from "react";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@heroui/modal";
import { Select, SelectItem } from "@nextui-org/react";

import { Action } from "@/types/action";

export default function Cip68(props: { onMint: Action; onUpdate: Action; imageUrl?: string }) {
  const { onMint, onUpdate, imageUrl } = props;

  function MintButton() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const [name, setTokenName] = useState("");
    const [image, setTokenImageURL] = useState(imageUrl || "");
    const [label, setTokenLabel] = useState(222);
    const [qty, setTokenQty] = useState(1);

    useEffect(() => {
      if (label == 222) setTokenQty(1);
    }, [label]);

    useEffect(() => {
      if (imageUrl) setTokenImageURL(imageUrl);
    }, [imageUrl]);

    return (
      <>
        <Button 
          onPress={onOpen} 
          className="bg-gradient-to-tr from-blue-500 to-purple-500 text-white shadow-lg" 
          radius="full"
        >
          Mint
        </Button>

        <Modal 
          isOpen={isOpen} 
          onOpenChange={onOpenChange}
          placement="top-center"
          isDismissable={false}
          hideCloseButton={false}
        >
          <ModalContent>
            {(onClose: () => void) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Mint</ModalHeader>
                <ModalBody>
                  <Input label="Name" placeholder=" " variant="bordered" onValueChange={setTokenName} />
                  <Input 
                    label="Image URL" 
                    placeholder=" " 
                    variant="bordered" 
                    value={image}
                    onValueChange={setTokenImageURL} 
                  />
                  <Select
                    label="Token type"
                    placeholder="Select token type"
                    className="max-w-xs"
                    defaultSelectedKeys={["222"]}
                    selectionMode="single"
                    selectedKeys={[label.toString()]}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as string;
                      if (value) {
                        console.log("Token type selected:", value);
                        setTokenLabel(parseInt(value));
                      }
                    }}
                  >
                    <SelectItem key="222" value="222">NFT</SelectItem>
                    <SelectItem key="333" value="333">FT</SelectItem>
                    <SelectItem key="444" value="444">RFT</SelectItem>
                  </Select>
                  <Input
                    type="number"
                    label="Quantity"
                    placeholder="1"
                    variant="bordered"
                    isDisabled={label == 222}
                    onValueChange={(value: string) => setTokenQty(parseInt(value))}
                    value={qty.toString()}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button
                    onPress={() => {
                      console.log("Mint button clicked");
                      console.log("Mint parameters:", { name, image, label, qty });
                      onMint({ name, image, label, qty })
                        .then((result) => {
                          console.log("Mint successful:", result);
                          onClose();
                        })
                        .catch((error) => {
                          console.error("Mint error:", error);
                          // You might want to show an error message to the user here
                        });
                    }}
                    className="bg-gradient-to-tr from-blue-500 to-purple-500 text-white shadow-lg"
                    radius="full"
                  >
                    Submit
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    );
  }

  function UpdateButton() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const [name, setTokenName] = useState("");
    const [image, setTokenImageURL] = useState("");

    return (
      <>
        <Button 
          onPress={onOpen} 
          className="bg-gradient-to-tr from-blue-500 to-purple-500 text-white shadow-lg" 
          radius="full"
        >
          Update
        </Button>

        <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
          <ModalContent>
            {(onClose: () => void) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Update</ModalHeader>
                <ModalBody>
                  <Input label="Name" placeholder="Enter token name" variant="bordered" onValueChange={setTokenName} />
                  <Input label="Image URL" placeholder="Enter token image URL" variant="bordered" onValueChange={setTokenImageURL} />
                </ModalBody>
                <ModalFooter>
                  <Button
                    onPress={() => {
                      console.log("Update button clicked");
                      console.log("Update parameters:", { name, image });
                      onUpdate({ name, image })
                        .then((result) => {
                          console.log("Update successful:", result);
                          onClose();
                        })
                        .catch((error) => {
                          console.error("Update error:", error);
                          // You might want to show an error message to the user here
                        });
                    }}
                    className="bg-gradient-to-tr from-blue-500 to-purple-500 text-white shadow-lg"
                    radius="full"
                  >
                    Submit
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      <MintButton />
      <UpdateButton />
    </div>
  );
}