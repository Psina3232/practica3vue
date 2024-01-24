Vue.component('kanban-card', {
    props: ['card', 'columnIndex', 'cardIndex'],
    template: `
        <div class="card">
            <div class="card-title">{{ card.title }}</div>
            <div class="card-date">Created: {{ card.dateCreated }}</div>
            <div class="card-date">Last Edited: {{ card.lastEdited }}</div>
            <div class="card-description">{{ card.description }}</div>
            <div class="card-deadline" v-if="card.deadline">Deadline: {{ card.deadline }}</div>
            <div class="card-actions">
                <button @click="editCard">Edit</button>
                <button @click="deleteCard">Delete</button>
                <button v-if="columnIndex === 0" @click="moveToInProgress">Move to 'In Progress'</button>
                <button v-if="columnIndex === 1" @click="moveToTesting">Move to 'Testing'</button>
            </div>
        </div>
    `,
    methods: {
        editCard() {
            this.$emit('edit-card', this.columnIndex, this.cardIndex);
        },
        deleteCard() {
            this.$emit('delete-card', this.columnIndex, this.cardIndex);
        },
        moveToInProgress() {
            this.$emit('move-to-in-progress', this.card, this.columnIndex, this.cardIndex);
        },
        moveToTesting() {
            this.$emit('move-to-testing', this.card, this.columnIndex, this.cardIndex);
        }
    }
});

new Vue({
    el: '#app',
    data: {
        columns: [
            { name: 'Запланированные задачи', cards: [] },
            { name: 'Задачи в работе', cards: [] },
            { name: 'Тестирование', cards: [] },
            { name: 'Выполненные задачи', cards: [] }
        ],
        newCard: { title: '', description: '', deadline: '' }
    },
    computed: {
        isFormValid() {
            return this.newCard.title && this.newCard.description && this.newCard.deadline;
        }
    },
    methods: {
        addCard(columnIndex) {
            if (columnIndex === 0 && this.isFormValid) {
                const newCard = {
                    title: this.newCard.title,
                    description: this.newCard.description,
                    deadline: this.newCard.deadline,
                    dateCreated: new Date().toLocaleString(),
                    lastEdited: new Date().toLocaleString()
                };
                this.columns[columnIndex].cards.push(newCard);
                this.clearNewCard();
            }
        },
        clearNewCard() {
            this.newCard = { title: '', description: '', deadline: '' };
        },
        editCard(columnIndex, cardIndex) {
            const card = this.columns[columnIndex].cards[cardIndex];
            const updatedTitle = prompt('Enter new title', card.title);
            const updatedDescription = prompt('Enter new description', card.description);
            const updatedDeadline = prompt('Enter new deadline', card.deadline);

            if (updatedTitle !== null && updatedDescription !== null && updatedDeadline !== null) {
                card.title = updatedTitle;
                card.description = updatedDescription;
                card.deadline = updatedDeadline;
                card.lastEdited = new Date().toLocaleString();
            }
        },
        deleteCard(columnIndex, cardIndex) {
            const confirmation = confirm('Are you sure you want to delete this card?');
            if (confirmation) {
                this.columns[columnIndex].cards.splice(cardIndex, 1);
            }
        },
        moveToInProgress(originalCard, columnIndex, cardIndex) {
            const inProgressIndex = 1;

            this.columns[inProgressIndex].cards.push({
                title: originalCard.title,
                description: originalCard.description,
                deadline: originalCard.deadline,
                dateCreated: originalCard.dateCreated,
                lastEdited: originalCard.lastEdited
            });

            this.columns[columnIndex].cards.splice(cardIndex, 1);
        },
        moveToTesting(originalCard, columnIndex, cardIndex) {
            const testingIndex = 2;

            this.columns[testingIndex].cards.push({
                title: originalCard.title,
                description: originalCard.description,
                deadline: originalCard.deadline,
                dateCreated: originalCard.dateCreated,
                lastEdited: originalCard.lastEdited
            });

            this.columns[columnIndex].cards.splice(cardIndex, 1);
        }
    }
});
