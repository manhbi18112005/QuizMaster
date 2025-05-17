"use client";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircledIcon, TrashIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import { DbQuestionBank, getAllQuestionBanks, saveQuestionBank, deleteQuestionBank } from "@/lib/db";

export default function Home() {
  const [questionBanks, setQuestionBanks] = useState<DbQuestionBank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newBankId, setNewBankId] = useState(""); // Added state for new bank ID
  const [newBankName, setNewBankName] = useState("");
  const [newBankDescription, setNewBankDescription] = useState("");
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [bankToDeleteId, setBankToDeleteId] = useState<string | null>(null);
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    async function loadQuestionBanks() {
      setIsLoading(true);
      try {
        const banks = await getAllQuestionBanks();
        setQuestionBanks(banks);
      } catch (error) {
        console.error("Failed to load question banks:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadQuestionBanks();
  }, []);

  const openCreateModal = () => {
    setNewBankId(""); // Reset ID field
    setNewBankName("");
    setNewBankDescription("");
    setIsCreateModalOpen(true);
  };

  const handleConfirmCreateBank = async () => {
    if (!newBankName.trim()) {
      alert("Bank name cannot be empty.");
      return;
    }
    // Basic validation for ID if provided (e.g., not just whitespace)
    // More complex validation (e.g., uniqueness) would ideally be handled by the DB layer or backend
    const idToSave = newBankId.trim() !== "" ? newBankId.trim() : undefined;

    try {
      await saveQuestionBank({
        id: idToSave, // Pass the ID if provided
        name: newBankName,
        description: newBankDescription,
        questions: [],
      });
      const updatedBanks = await getAllQuestionBanks();
      setQuestionBanks(updatedBanks);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Failed to create new bank:", error);
    }
  };

  const confirmDeleteBank = async () => {
    if (bankToDeleteId) {
      try {
        await deleteQuestionBank(bankToDeleteId);
        const updatedBanks = await getAllQuestionBanks();
        setQuestionBanks(updatedBanks);
      } catch (error) {
        console.error("Failed to delete question bank:", error);
      } finally {
        setIsDeleteAlertOpen(false);
        setBankToDeleteId(null);
      }
    }
  };

  const openDeleteAlert = (bankId: string) => {
    setBankToDeleteId(bankId);
    setIsDeleteAlertOpen(true);
  };

  const handleViewBank = (bankId: string) => {
    router.push(`/${bankId}`); // Navigate to /<bankId>
  };

  if (isLoading) {
    return (
      <ContentLayout title="Student Revision Quizzes">
        <p>Loading question banks...</p>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Student Revision Quizzes">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold hidden sm:block">Your Question Banks</h2>
        <Button onClick={openCreateModal}>
          <PlusCircledIcon className="mr-2 h-4 w-4" /> Create New Bank
        </Button>
      </div>

      {questionBanks.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center mt-10">
          <Card className="w-full max-w-md p-6">
            <CardHeader>
              <CardTitle className="text-2xl">No Question Banks Yet!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                It looks like you have not created any question banks. Get started by creating your first one.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={openCreateModal} size="lg">
                <PlusCircledIcon className="mr-2 h-5 w-5" /> Create Your First Bank
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {questionBanks.map((bank) => (
            <Card key={bank.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{bank.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p>{bank.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{bank.questions?.length} Questions</span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewBank(bank.id)} // Updated onClick
                  >
                    View Bank
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openDeleteAlert(bank.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Question Bank</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new question bank. Click create when you are done.
              You can optionally provide an ID, or one will be generated.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="id" className="text-right">ID</Label>
              <Input
                id="id"
                value={newBankId}
                onChange={(e) => setNewBankId(e.target.value)}
                className="col-span-3"
                placeholder="e.g., custom-bank-id (or leave blank)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newBankName}
                onChange={(e) => setNewBankName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Algebra Basics"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={newBankDescription}
                onChange={(e) => setNewBankDescription(e.target.value)}
                className="col-span-3"
                placeholder="e.g., A collection of fundamental algebra questions."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmCreateBank}>Create Bank</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              question bank and all its associated questions (if any linking is implemented).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBankToDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteBank}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ContentLayout>
  );
}
