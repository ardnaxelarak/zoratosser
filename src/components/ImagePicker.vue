<template>
  <div ref="modal" class="modal fade" :id="id" data-bs-background="static" data-bs-keyboard="false">
    <div class="modal-dialog image-picker modal-lg">
      <div class="modal-header">
        <h5 class="modal-title">Choose an Image</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <nav>
          <ul class="nav nav-tabs" role="tablist">
            <li class="nav-item" role="presentation" v-for="imageSet in imageSetsSorted">
              <button class="nav-link" :data-toggle-name="imageSet.name" data-bs-toggle="tab" :data-bs-target='`div[data-set-name="${imageSet.name}"]`' type="button" role="tab">{{ imageSet.name }}</button>
            </li>
          </ul>
        </nav>
        <div class="tab-content">
          <template v-for="imageSet in imageSetsSorted">
            <div class="tab-pane fade mt-4" :data-set-name="imageSet.name">
              <div class="text-center" v-if="imageSet.description">
                <vue-markdown :source="imageSet.description" :options="{linkify: true}" />
              </div>
              <div class="image-list">
                <template v-for="image in imageSet.images">
                  <ImagePickerCard :image="image" @icon-click="icon_clicked" @delete="delete_clicked" />
                </template>
              </div>
            </div>
          </template>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-primary" @click="upload_clicked">Upload</button>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import axios from "axios";
import sort from "immutable-sort";
import { Modal } from "bootstrap";
import VueMarkdown from 'vue-markdown-render'

import ImagePickerCard from '../components/ImagePickerCard.vue'

export default defineComponent({
  props: ['id'],
  components: {
    ImagePickerCard,
    VueMarkdown,
  },
  data() {
    return {
      images: [],
      imageSets: [],
    };
  },
  computed: {
    modal() {
      return Modal.getOrCreateInstance(`#${this.id}`);
    },
    imageMap() {
      const sets = this.images.concat(this.imageSets.map(m => m.images));
      return sets.flatMap(m => m).reduce((map, obj) => {
        map[obj.id] = obj;
        return map;
      }, {});
    },
    imageSetsSorted() {
      const sortedSets = this.imageSets.map(set => ({...set, images: sort(set.images, this.sortBy(m => m.name))}));
      const sortedSetList = sort(sortedSets, this.sortBy(m => m.name));
      return [{name: "User", images: this.imagesSorted}].concat(sortedSets);
    },
    imagesSorted() {
      return sort(this.images, this.sortBy(m => m.name));
    },
  },
  async created() {
    axios.get("/api/images").then(response => this.images = response.data);
    axios.get("/api/image_sets").then(response => this.imageSets = response.data);
  },
  mounted() {
    this.$refs.modal.addEventListener("show.bs.modal", this.show);
    this.$refs.modal.addEventListener("hidden.bs.modal", this.hidden);
  },
  methods: {
    sortBy(func) {
      return (a, b) => {
        const aKey = func(a).toLowerCase();
        const bKey = func(b).toLowerCase();
        if (aKey < bKey) {
          return -1;
        } else if (aKey > bKey) {
          return 1;
        } else {
          return 0;
        }
      };
    },
    icon_clicked(data) {
      this.$emit("imageSelected", {id: data.image.id, url: data.image.url});
      this.modal.hide();
    },
    async delete_clicked(data) {
      if (!data.id) {
        return;
      }

      try {
        await axios.delete(`/api/images/${data.id}`);

        const index = this.images.findIndex(im => im.id == data.id);
        if (index >= 0) {
          this.images.splice(index, 1);
        }
      } catch (err) {
        console.log(err);
      }
    },
    async upload_clicked(event) {
      const pickerOpts = {
        types: [
          {
            description: "Images",
            accept: { "image/*": [".png", ".gif", ".jpeg", ".jpg", ".svg"] },
          },
        ],
        excludeAcceptAllOption: true,
        multiple: false,
      };

      const formData = new FormData();
      try {
        const [fileHandle] = await window.showOpenFilePicker(pickerOpts);
        formData.append("image", await fileHandle.getFile());
        formData.append("name", fileHandle.name);
      } catch(err) {
        console.log(err);
        return;
      }

      const response = await axios.post("/api/images", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      this.images.push(response.data);
      this.$emit("imageSelected", {id: response.data.id, url: response.data.url});
      this.modal.hide();
    },
    show() {
      axios.get("/api/images").then(response => this.images = response.data);
      axios.get("/api/image_sets").then(response => this.imageSets = response.data);
      document.querySelector("button[data-toggle-name='User']").click();
    },
    hidden() {
      this.$emit("pickerClosed");
    },
  },
});
</script>

<style>
.image-picker {
  background-color: var(--bs-modal-bg);
  border-width: var(--bs-modal-border-width);
  border-color: var(--bs-modal-border-color);
  border-radius: var(--bs-modal-border-radius);
  pointer-events: all;
}

.image-picker .image-list {
  display: flex;
  flex-wrap: wrap;
}
</style>
