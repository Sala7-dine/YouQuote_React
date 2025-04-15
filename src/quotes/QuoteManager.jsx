import React, { useState, useEffect } from "react";
import axios from "axios";

function QuoteManager() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [newQuote, setNewQuote] = useState({ content: '', author: '', category: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [categories, setCategories] = useState([
    'Motivation', 'Success', 'Life', 'Happiness', 'Wisdom', 'Love'
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Récupérer le token d'authentification
  const token = localStorage.getItem('token');

  // Configuration des headers pour les requêtes authentifiées
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  // Charger les citations au chargement de la page
  useEffect(() => {
    fetchQuotes();
  }, []);

  // Récupérer les citations depuis l'API
  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/quotes", config);
      setQuotes(response.data);
      setError('');
    } catch (error) {
      console.error('Erreur lors du chargement des citations:', error);
      setError('Impossible de charger les citations. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Supprimer une citation
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette citation?')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/quotes/${id}`, config);
        setQuotes(quotes.filter(quote => quote.id !== id));
        setError('');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        setError('La suppression a échoué. Veuillez réessayer.');
      }
    }
  };

  // Préparer l'édition d'une citation
  const handleEdit = (quote) => {
    setSelectedQuote(quote);
    setNewQuote({
      content: quote.content,
      author: quote.author,
      category: quote.category
    });
    setIsEditing(true);
    setIsAdding(false);
  };

  // Préparer l'ajout d'une nouvelle citation
  const handleAddNew = () => {
    setNewQuote({ content: '', author: '', category: '' });
    setIsAdding(true);
    setIsEditing(false);
  };

  // Mettre à jour une citation existante
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      await axios.put(
        `http://127.0.0.1:8000/api/quotes/${selectedQuote.id}`,
        newQuote,
        config
      );
      
      const updatedQuotes = quotes.map(quote => 
        quote.id === selectedQuote.id 
          ? { ...quote, ...newQuote } 
          : quote
      );
      
      setQuotes(updatedQuotes);
      setIsEditing(false);
      setError('');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setError('La mise à jour a échoué. Veuillez réessayer.');
    }
  };

  // Ajouter une nouvelle citation
  const handleCreate = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/quotes",
        newQuote,
        config
      );
      
      setQuotes([...quotes, response.data]);
      setIsAdding(false);
      setNewQuote({ content: '', author: '', category: '' });
      setError('');
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      setError('La création a échoué. Veuillez réessayer.');
    }
  };

  // Filtrer les citations selon les critères de recherche
  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = searchTerm === '' || 
      quote.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.author.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = filterCategory === '' || 
      quote.category === filterCategory;
      
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Mes Citations</h1>
            <p className="text-gray-400">Gérez votre collection de citations inspirantes</p>
          </div>
          <button
            onClick={handleAddNew}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium transition-colors hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Ajouter une citation
          </button>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm">
            <div className="flex">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Filtres et recherche */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-400 mb-1">Rechercher</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="search"
                  type="text"
                  placeholder="Rechercher par contenu ou auteur"
                  className="block w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-gray-700"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <label htmlFor="category" className="block text-sm font-medium text-gray-400 mb-1">Catégorie</label>
              <select
                id="category"
                className="block w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-gray-700"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">Toutes les catégories</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('');
                }}
                className="px-4 py-2 border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Formulaire d'ajout/édition */}
        {(isAdding || isEditing) && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4">
              {isAdding ? "Ajouter une nouvelle citation" : "Modifier la citation"}
            </h2>
            <form onSubmit={isAdding ? handleCreate : handleUpdate} className="space-y-4">
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-1">Contenu</label>
                <textarea
                  id="content"
                  rows="3"
                  required
                  className="block w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-gray-700"
                  placeholder="Entrez le texte de la citation"
                  value={newQuote.content}
                  onChange={(e) => setNewQuote({...newQuote, content: e.target.value})}
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="author" className="block text-sm font-medium text-gray-300 mb-1">Auteur</label>
                  <input
                    id="author"
                    type="text"
                    required
                    className="block w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-gray-700"
                    placeholder="Nom de l'auteur"
                    value={newQuote.author}
                    onChange={(e) => setNewQuote({...newQuote, author: e.target.value})}
                  />
                </div>
                
                <div>
                  <label htmlFor="add-category" className="block text-sm font-medium text-gray-300 mb-1">Catégorie</label>
                  <select
                    id="add-category"
                    required
                    className="block w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-gray-700"
                    value={newQuote.category}
                    onChange={(e) => setNewQuote({...newQuote, category: e.target.value})}
                  >
                    <option value="" disabled>Sélectionnez une catégorie</option>
                    {categories.map((category, index) => (
                      <option key={index} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
                >
                  {isAdding ? "Ajouter" : "Mettre à jour"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des citations */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin h-8 w-8 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
            <h3 className="text-xl font-medium text-gray-400 mb-1">Aucune citation trouvée</h3>
            <p className="text-gray-500">
              {searchTerm || filterCategory ? 
                "Essayez de modifier vos critères de recherche." : 
                "Commencez par ajouter une nouvelle citation."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuotes.map(quote => (
              <div key={quote.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg transition-transform hover:transform hover:scale-[1.02]">
                <div className="p-6">
                  <div className="flex items-start mb-4">
                    <div className="mr-3 mt-1 text-2xl text-cyan-500">❝</div>
                    <div className="flex-1">
                      <p className="text-white text-lg font-medium leading-relaxed">{quote.content}</p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 font-medium">— {quote.author}</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 mt-2 rounded-full text-xs font-medium bg-blue-900/40 text-blue-300">
                        {quote.category}
                      </span>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEdit(quote)}
                        className="p-2 text-gray-400 hover:text-cyan-400 transition-colors rounded-lg hover:bg-gray-800"
                        title="Modifier"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(quote.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-gray-800"
                        title="Supprimer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default QuoteManager;